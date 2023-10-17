import {
    EIP712_DOMAIN,
    LIMIT_ORDER_PROTOCOL_ABI,
    PROTOCOL_NAME,
    PROTOCOL_VERSION,
    TypedDataVersion,
} from './limit-order-protocol.const';
import {
    Address,
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderProtocolMethodsV3,
    LimitOrderSignature,
    MakerTraits,
    TakerTraits,
} from './model/limit-order-protocol.model';
import {compactSignature,} from './utils/limit-order.utils';
import {TypedDataUtils} from '@metamask/eth-sig-util';
import {AbstractSmartcontractFacade} from './utils/abstract-facade';
import {Series} from "./model/series-nonce-manager.model";
import {fillWithMakingAmount} from "./e2e-tests/tests/helpers/utils";
import {solidityPack} from "ethers/lib/utils";


export interface FillOrderParamsWithTakerTraits {
    order: LimitOrder;
    signature: LimitOrderSignature;
    amount: string;
    takerTraits: TakerTraits;
}

export type FillOrderArgs = FillOrderParamsWithTakerTraits & {
    args: string;
}

export type PermitAndCallParams = FillOrderArgs & {
    target: Address;
    permitToken: Address;
    permit: string;
    interaction: string;
}

export interface ErrorResponse extends Error {
    data: string,
}


export class LimitOrderProtocolFacade
    extends AbstractSmartcontractFacade<LimitOrderProtocolMethods | LimitOrderProtocolMethodsV3>
{
    ABI = LIMIT_ORDER_PROTOCOL_ABI;

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

    fillLimitOrderArgs(params: FillOrderArgs): string {
        const {
            order,
            signature,
            amount,
            takerTraits,
            args,
        } = params;

        const { r, vs } = compactSignature(signature);


        return this.getContractCallData(LimitOrderProtocolMethods.fillOrderArgs, [
            order,
            r,
            vs,
            amount,
            takerTraits,
            args,
        ]);
    }

    permitAndCall(params: PermitAndCallParams): string {
        const {
            permit,
            permitToken,
        } = params;

        const packedPermit = solidityPack(
            ['address', 'bytes'],
            [permitToken, permit],
        );

        const fillOrderArgsCalldata = this.fillLimitOrderArgs(params);

        return this.getContractCallData(
            LimitOrderProtocolMethods.permitAndCall,
            [packedPermit, fillOrderArgsCalldata]
        );
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

    orderHash(order: LimitOrder): Promise<string> {
        const calldata = this.getContractCallData(
            LimitOrderProtocolMethods.hashOrder,
            [
                order
            ]);

        return this.makeViewCall(calldata);
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
