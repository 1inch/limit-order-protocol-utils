import {LimitOrderProtocolMethods, Nonce} from './model/limit-order-protocol.model';
import {ZX} from './limit-order-protocol.const';
import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import {joinStaticCalls} from './utils/limit-order.utils';

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
        makerNonce: Nonce,
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethods.nonceEquals,
            [makerAddress, makerNonce]
        );
    };

    /**
     * @param timestamp seconds unit
     */
    timestampBelow = (timestamp: number | bigint): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethods.timestampBelow,
            [ZX + timestamp.toString(16)]
        );
    };

    /**
     * @param timestamp seconds unit
     */
    timestampBelowAndNonceEquals = (
        timestamp: number | bigint,
        nonce: Nonce,
        address: string,
    ): LimitOrderPredicateCallData => {
        const predicateValue = BigInt(address)
            + (BigInt(nonce) << BigInt(160))
            + (BigInt(timestamp) << BigInt(208));

        return this.facade.getContractCallData(
            LimitOrderProtocolMethods.timestampBelowAndNonceEquals,
            [ZX + predicateValue.toString(16)]
        );
    }

    arbitraryStaticCall = (
        target: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.arbitraryStaticCall, [
            target,
            callData,
        ]);
    };
}
