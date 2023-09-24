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
    MakerTraits,
    LimitOrderProtocolMethodsV3,
    Address,
} from './model/limit-order-protocol.model';
import {BigNumber} from '@ethersproject/bignumber';
import {
    compactSignature,
    setN,
} from './utils/limit-order.utils';
import {TypedDataUtils} from '@metamask/eth-sig-util';
import { AbstractSmartcontractFacade } from './utils/abstract-facade';
import {Series} from "./model/series-nonce-manager.model";


export type TakerTraits = string;
// todo move into model
export interface FillOrderParams {
    order: LimitOrder;
    signature: LimitOrderSignature;
    amount: string;
    takerTraits: TakerTraits;
}

export type FillOrderToExtParams = FillOrderParams & {
    extension: string;
}

export type FillOrderToWithPermitParams = FillOrderParams & {
    target: Address;
    permit: string;
    interaction: string;
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

    fillLimitOrderExt(params: FillOrderToExtParams): string {
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

    fillOrderToWithPermit(params: FillOrderToWithPermitParams): string {
        const {
            order,
            amount,
            takerTraits,
            target,
            permit,
            interaction,
        } = params;

        const { r, vs } = this.getCompactSignature(params);

        return this.getContractCallData(LimitOrderProtocolMethods.fillOrderToWithPermit, [
            order,
            r,
            vs,
            amount,
            takerTraits,
            target,
            permit,
            interaction,
        ]);
    }

    cancelLimitOrder(makerTraits: MakerTraits, orderHash: string): string {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            makerTraits,
            orderHash,
        ]);
    }

    increaseEpoch(series: Series): string {
        return this.getContractCallData(LimitOrderProtocolMethods.increaseEpoch, [
            series
        ]);
    }

    epoch(maker: Address, series: Series): Promise<bigint> {
        const calldata = this.getContractCallData(LimitOrderProtocolMethods.epoch, [
            maker,
            series,
        ]);

        return this.makeViewCall(calldata, BigInt);
    }

    remainingInvalidatorForOrder(maker: Address, orderHash: string): Promise<bigint> {
        const calldata = this.getContractCallData(
            LimitOrderProtocolMethods.remainingInvalidatorForOrder,
            [
            maker,
            orderHash,
        ]);

        return this.makeViewCall(calldata, BigInt)
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

    private getCompactSignature({ signature }: { signature: string }): { r: string, vs: string } {
        return compactSignature(signature);
    }

    private makeViewCall<T = string>(
        calldata: string,
        parser?: (result: string) => T
    ): Promise<T> {
        return this.providerConnector
            .ethCall(this.contractAddress, calldata)
            .then(parser ? parser : undefined);
    }
}
