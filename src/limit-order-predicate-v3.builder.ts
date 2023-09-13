import {
    LimitOrderProtocolMethodsV3,
    Nonce,
    PredicateTimestamp
} from "./model/limit-order-protocol.model";
import {ZX} from "./limit-order-protocol.const";
import {LimitOrderPredicateCallData} from "./limit-order-predicate.builder";
import {LimitOrderProtocolFacade} from "./limit-order-protocol.facade";

export class LimitOrderPredicateV3Builder {
    constructor(private readonly facade: LimitOrderProtocolFacade) {}

    /**
     * @param timestamp seconds unit
     * need to support legacy orders v3
     */
    timestampBelow = (timestamp: PredicateTimestamp): LimitOrderPredicateCallData => {
        return this.facade.getContractCallData(
            LimitOrderProtocolMethodsV3.timestampBelow,
            [ZX + timestamp.toString(16)]
        );
    };

    /**
     * @param timestamp seconds unit
     * need to support legacy orders v3
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
}
