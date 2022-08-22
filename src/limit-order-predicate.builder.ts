import {LimitOrderProtocolMethods} from './model/limit-order-protocol.model';
import {ZX} from './limit-order-protocol.const';
import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import {joinStaticCalls} from './utils/limit-order.utils';
import {BigNumber} from '@ethersproject/bignumber';

export type LimitOrderPredicateCallData = string;

export class LimitOrderPredicateBuilder {
    constructor(private readonly facade: LimitOrderProtocolFacade) {}

    and = (
        ...predicates: LimitOrderPredicateCallData[]
    ): LimitOrderPredicateCallData => {
        const { offsets, data } = joinStaticCalls(predicates);

        return this.facade.getContractCallData(LimitOrderProtocolMethods.and, [
            offsets,
            data,
        ]);
    };

    or = (
        ...predicates: LimitOrderPredicateCallData[]
    ): LimitOrderPredicateCallData => {
        const { offsets, data } = joinStaticCalls(predicates);

        return this.facade.getContractCallData(LimitOrderProtocolMethods.or, [
            offsets,
            data,
        ]);
    };

    eq = (
        value: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.eq, [
            value,
            callData,
        ]);
    };

    lt = (
        value: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.lt, [
            value,
            callData,
        ]);
    };

    gt = (
        value: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.gt, [
            value,
            callData,
        ]);
    };

    nonceEquals = (
        makerAddress: string,
        makerNonce: number
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethods.nonceEquals,
            [makerAddress, makerNonce]
        );
    };

    timestampBelow = (timestamp: number): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethods.timestampBelow,
            [ZX + timestamp.toString(16)]
        );
    };

    timestampBelowAndNonceEquals = (timestamp: number, nonce: number, address: string) => {
        const predicateValue = BigInt(address)
            + (BigInt(nonce) << BigInt(160))
            + (BigInt(timestamp) << BigInt(208));

        return this.facade.getContractCallData(
            LimitOrderProtocolMethods.timestampBelowAndNonceEquals,
            [ZX + predicateValue.toString(16)]
        );
    }
}
