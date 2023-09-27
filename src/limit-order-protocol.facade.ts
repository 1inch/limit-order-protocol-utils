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
    LimitOrderSignature,
    MakerTraits,
    LimitOrderProtocolMethodsV3,
    Address,
} from './model/limit-order-protocol.model';
import {
    compactSignature,
    setN,
} from './utils/limit-order.utils';
import {TypedDataUtils} from '@metamask/eth-sig-util';
import { AbstractSmartcontractFacade } from './utils/abstract-facade';
import {Series} from "./model/series-nonce-manager.model";


export type TakerTraits = string;
// todo move into model
export interface FillOrderParamsWithTakerTraits {
    order: LimitOrder;
    signature: LimitOrderSignature;
    amount: string;
    takerTraits: TakerTraits;
}

export type FillOrderToExtParams = FillOrderParamsWithTakerTraits & {
    extension: string;
}

export type FillOrderToWithPermitParams = FillOrderParamsWithTakerTraits & {
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

    fillLimitOrderWithMakingAmount(
        params: Omit<FillOrderParamsWithTakerTraits, 'takerTraits'>,
        makingAmount: string | bigint,
    ): string {
        const takerTraits = fillWithMakingAmount(BigInt(makingAmount));
        return this.fillLimitOrder({
            ...params,
            takerTraits,
        })
    }

    fillLimitOrder(params: FillOrderParamsWithTakerTraits): string {
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

    async checkPredicate(predicate: string): Promise<boolean> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.checkPredicate,
            [predicate]
        );

        const result = await this.makeViewCall(callData, BigInt);
        try {
            return result === BigInt(1);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    remainingInvalidatorForOrder(maker: Address, orderHash: string): Promise<bigint> {
        const calldata = this.getContractCallData(
            LimitOrderProtocolMethods.remainingInvalidatorForOrder,
            [
            maker,
            orderHash,
        ]);

        return this.makeViewCall(calldata, BigInt);
    }

    rawRemainingInvalidatorForOrder(maker: Address, orderHash: string): Promise<bigint> {
        const calldata = this.getContractCallData(
            LimitOrderProtocolMethods.rawRemainingInvalidatorForOrder,
            [
            maker,
            orderHash,
        ]);

        return this.makeViewCall(calldata, BigInt);
    }

    remaining(maker: Address, orderHash: string): Promise<bigint> {
        const calldata = this.getContractCallData(
            LimitOrderProtocolMethods.remaining,
            [
            maker,
            orderHash,
        ]);

        return this.makeViewCall(calldata, BigInt);
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
