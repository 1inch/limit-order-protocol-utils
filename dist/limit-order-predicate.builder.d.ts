import { LimitOrderProtocolFacade } from './limit-order-protocol.facade';
export declare type LimitOrderPredicateCallData = string;
export declare class LimitOrderPredicateBuilder {
    private readonly facade;
    constructor(facade: LimitOrderProtocolFacade);
    and: (...predicates: LimitOrderPredicateCallData[]) => LimitOrderPredicateCallData;
    or: (...predicates: LimitOrderPredicateCallData[]) => LimitOrderPredicateCallData;
    eq: (value: string, address: string, callData: string) => LimitOrderPredicateCallData;
    lt: (value: string, address: string, callData: string) => LimitOrderPredicateCallData;
    gt: (value: string, address: string, callData: string) => LimitOrderPredicateCallData;
    nonceEquals: (makerAddress: string, makerNonce: number) => LimitOrderPredicateCallData;
    timestampBelow: (timestamp: number) => LimitOrderPredicateCallData;
}
