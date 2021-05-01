import {LimitOrderProtocolMethods} from './model/limit-order-protocol.model';
import {ZX} from './limit-order-protocol.const';
import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';

export type LimitOrderPredicateCallData = string;

export class LimitOrderPredicateBuilder {
    constructor(private readonly facade: LimitOrderProtocolFacade) {}

    and = (
        ...predicates: LimitOrderPredicateCallData[]
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.and, [
            predicates.map(() => this.facade.contractAddress),
            predicates,
        ]);
    };

    or = (
        ...predicates: LimitOrderPredicateCallData[]
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.or, [
            predicates.map(() => this.facade.contractAddress),
            predicates,
        ]);
    };

    eq = (
        value: string,
        address: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.eq, [
            value,
            address,
            callData,
        ]);
    };

    lt = (
        value: string,
        address: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.lt, [
            value,
            address,
            callData,
        ]);
    };

    gt = (
        value: string,
        address: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethods.gt, [
            value,
            address,
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
}
