import {
    LimitOrderProtocolMethodsV3,
    Nonce,
    PredicateTimestamp
} from "./model/limit-order-protocol.model";
import {ZX} from "./limit-order-protocol.const";
import {LimitOrderPredicateCallData} from "./limit-order-predicate.builder";
import {LimitOrderBuilder} from "./limit-order.builder";
import {AbstractSmartcontractFacade} from "./utils/abstract-facade";
import {LimitOrderProtocolV3Facade} from "./limit-order-protocol-v3.facade";

export class LimitOrderPredicateV3Builder {
    constructor(private readonly facade: LimitOrderProtocolV3Facade) {}

    and = (
        ...predicates: LimitOrderPredicateCallData[]
    ): LimitOrderPredicateCallData => {
        const { offsets, data } = LimitOrderBuilder.joinStaticCalls(predicates);

        return this.facade.getContractCallData(LimitOrderProtocolMethodsV3.and, [
            offsets,
            data,
        ]);
    };

    or = (
        ...predicates: LimitOrderPredicateCallData[]
    ): LimitOrderPredicateCallData => {
        const { offsets, data } = LimitOrderBuilder.joinStaticCalls(predicates);

        return this.facade.getContractCallData(LimitOrderProtocolMethodsV3.or, [
            offsets,
            data,
        ]);
    };

    eq = (
        value: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethodsV3.eq, [
            value,
            callData,
        ]);
    };

    lt = (
        value: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethodsV3.lt, [
            value,
            callData,
        ]);
    };

    gt = (
        value: string,
        callData: string
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(LimitOrderProtocolMethodsV3.gt, [
            value,
            callData,
        ]);
    };

    nonce = (makerAddress: string): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethodsV3.nonce,
            [makerAddress]
        );
    }

    nonceEquals = (
        makerAddress: string,
        makerNonce: Nonce,
    ): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethodsV3.nonceEquals,
            [makerAddress, makerNonce]
        );
    };

    /**
     * @param timestamp seconds unit
     */
    timestampBelow = (timestamp: PredicateTimestamp): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethodsV3.timestampBelow,
            [ZX + timestamp.toString(16)]
        );
    };

    /**
     * @param timestamp seconds unit
     */
    timestampBelowAndNonceEquals = (
        timestamp: PredicateTimestamp,
        nonce: Nonce,
        address: string,
    ): LimitOrderPredicateCallData => {
        const predicateValue = BigInt(address)
            + (BigInt(nonce) << BigInt(160))
            + (BigInt(timestamp) << BigInt(208));

        return this.facade.getContractCallData(
            LimitOrderProtocolMethodsV3.timestampBelowAndNonceEquals,
            [ZX + predicateValue.toString(16)]
        );
    }

    arbitraryStaticCall = (
        target: string | AbstractSmartcontractFacade<string>,
        callData: string
    ): LimitOrderPredicateCallData => {
        const address = target instanceof AbstractSmartcontractFacade
            ? target.contractAddress
            : target;

        if (address.toLowerCase() === this.facade.contractAddress.toLowerCase()) {
            console.warn(
                'Unnecessary arbitraryStaticCall(). '
                + 'Omit it when interacting with limit-order-protocol methods.'
            );

            return callData;
        }

        return this.facade.getContractCallData(LimitOrderProtocolMethodsV3.arbitraryStaticCall, [
            address,
            callData,
        ]);
    };
}
