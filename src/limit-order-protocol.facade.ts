import {
    LIMIT_ORDER_PROTOCOL_ABI,
    EIP712_DOMAIN,
    PROTOCOL_NAME,
    PROTOCOL_VERSION,
    TypedDataVersion,
} from './limit-order-protocol.const';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature,
    RFQOrderInfo,
    RFQOrder, MakerTraits, LimitOrderProtocolMethodsV3, Address,
} from './model/limit-order-protocol.model';
import {BigNumber} from '@ethersproject/bignumber';
import {
    compactSignature,
    getMakingAmountForRFQ, setN,
} from './utils/limit-order.utils';
import {TypedDataUtils} from '@metamask/eth-sig-util';
import { AbstractSmartcontractFacade } from './utils/abstract-facade';


export type TakerTraits = string;
// todo move into model
export interface FillOrderParams {
    order: LimitOrder;
    signature: LimitOrderSignature;
    amount: string;
    takerTraits: TakerTraits;
}

export type FillOrderParamsExt = FillOrderParams & {
    extension: string;
}

export type FillLimitOrderWithPermitParams = FillOrderParams & {
    targetAddress: string;
    permit: string;
}

export interface ErrorResponse extends Error {
    data: string,
}

export function fillWithMakingAmount (amount: bigint): string {
    return setN(amount, 255, true).toString();
}

export class LimitOrderProtocolFacade
    extends AbstractSmartcontractFacade<LimitOrderProtocolMethods | LimitOrderProtocolMethodsV3>
{
    ABI = LIMIT_ORDER_PROTOCOL_ABI;

    fillLimitOrder(params: FillOrderParams): string {
        const {
            order,
            signature,
            amount,
            takerTraits
        } = params;

        const { r, vs } = compactSignature(signature);

        return this.getContractCallData(LimitOrderProtocolMethods.fillOrder, [
            order,
            r,
            vs,
            amount,
            takerTraits,
        ]);
    }

    fillLimitOrderExt(params: FillOrderParamsExt): string {
        const {
            order,
            signature,
            amount,
            takerTraits,
            extension
        } = params;

        const { r, vs } = compactSignature(signature);

        return this.getContractCallData(LimitOrderProtocolMethods.fillOrderExt, [
            order,
            r,
            vs,
            amount,
            takerTraits,
            extension,
        ]);
    }

    /**
     * @param params.interaction pre-interaction in fact.
     * @param params.skipPermit skip maker's permit evaluation if it was evaluated before.
     * Useful if multiple orders was created with same nonce.
     *
     * Tip: you can just check if allowance exsists and then set it to `true`.
     */
    // fillOrderToWithPermit(params: FillLimitOrderWithPermitParams): string {
    //     const {
    //         order,
    //         signature,
    //         makingAmount,
    //         takingAmount,
    //         interaction = ZX,
    //         thresholdAmount,
    //         skipPermit = false,
    //         targetAddress,
    //         permit,
    //     } = params;
    //
    //     return this.getContractCallData(
    //         LimitOrderProtocolMethods.fillOrderToWithPermit,
    //         [
    //             order,
    //             signature,
    //             interaction,
    //             makingAmount,
    //             takingAmount,
    //             // skipPermitAndThresholdAmount
    //             packSkipPermitAndThresholdAmount(thresholdAmount, skipPermit),
    //             targetAddress,
    //             permit
    //         ],
    //     );
    // }

    fillRFQOrder(
        order: RFQOrder,
        signature: LimitOrderSignature,
        makingAmount?: string,
        takingAmount?: string
    ): string {
        let flagsAndAmount = '0';
        if (makingAmount) {
            flagsAndAmount = getMakingAmountForRFQ(makingAmount);
        } else if (takingAmount) {
            flagsAndAmount = takingAmount;
        }

        return this.getContractCallData(
            LimitOrderProtocolMethods.fillOrderRFQ,
            [order, signature, flagsAndAmount]
        );
    }

    cancelLimitOrderV3(order: LimitOrder): string {
        // use old ABI
        return this.getContractCallData(LimitOrderProtocolMethodsV3.cancelOrder, [
            order,
        ]);
    }

    cancelLimitOrder(makerTraits: MakerTraits, orderHash: string): string {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            makerTraits,
            orderHash,
        ]);
    }

    increaseEpoch(series: string): string {
        return this.getContractCallData(LimitOrderProtocolMethods.increaseEpoch, [
            series
        ]);
    }

    epoch(maker: Address, series: string): string {
        return this.getContractCallData(LimitOrderProtocolMethods.epoch, [
            maker,
            series,
        ]);
    }

    remainingInvalidatorForOrder(maker: Address, orderHash: string): string {
        return this.getContractCallData(LimitOrderProtocolMethods.remainingInvalidatorForOrder, [
            maker,
            orderHash,
        ]);
    }


    cancelRFQOrder(orderInfo: RFQOrderInfo): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.cancelOrderRFQ,
            [orderInfo]
        );
    }

    nonce(makerAddress: string): Promise<bigint> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.nonce,
            [makerAddress]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((nonce) => BigInt(nonce));
    }

    advanceNonce(count: number): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.advanceNonce,
            [count]
        );
    }

    increaseNonce(): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.increaseNonce
        );
    }

    checkPredicate(order: LimitOrder): Promise<boolean> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.checkPredicate,
            [order]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .catch((error) => {
                console.error(error);

                return false;
            })
            .then((result) => {
                try {
                    return BigNumber.from(result).toNumber() === 1;
                } catch (e) {
                    console.error(e);

                    return false;
                }
            });
    }

    remaining(orderHash: LimitOrderHash): Promise<BigNumber> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.remaining,
            [orderHash]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                const response = this.parseRemainingResponse(result);

                if (response !== null) {
                    return response;
                }

                return Promise.reject(result);
            });
    }

    // https://github.com/1inch/limit-order-protocol/blob/v3-prerelease/test/helpers/eip712.js#L22
    domainSeparator(): Promise<string> {
        const hex = '0x' + TypedDataUtils.hashStruct(
            'EIP712Domain',
            {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            { EIP712Domain: EIP712_DOMAIN },
            TypedDataVersion,
        ).toString('hex')

        return Promise.resolve(hex);
    }

    parseRemainingResponse(response: string): BigNumber | null {
        if (response.length === 66) {
            return BigNumber.from(response);
        }

        return null;
    }
}
