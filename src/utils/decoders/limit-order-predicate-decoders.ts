import { LimitOrderDecoder } from "../../limit-order.decoder";
import {
    CallArguments,
    DecodableCall,
    DecodersImplementation,
    PredicateBytes,
    PredicateFn,
} from "../../limit-order-predicate.decoder";
import { FunctionFragment } from "@ethersproject/abi";
import { unpackTimestampAndNoncePredicate } from "../limit-order.utils";


export class LimitOrderPredicateDecoders
    implements DecodersImplementation<LimitOrderPredicateDecoders>
{
    or = this.logicalDecoder;

    and = this.logicalDecoder;

    lt = this.comparingDecoder;

    gt = this.comparingDecoder;

    eq = this.comparingDecoder;

    arbitraryStaticCall(fn: FunctionFragment, data: CallArguments, contract: string): PredicateFn {
        return new PredicateFn(
            fn.name,
            {
                target: new PredicateBytes(data.target, contract),
                data: new DecodableCall(data.data, data.target),
            },
            contract,
        );
    }

    timestampBelow(fn: FunctionFragment, data: CallArguments, contract: string): PredicateFn {
        return new PredicateFn(
            fn.name,
            {
                timestamp: new PredicateBytes(data.time, contract),
            },
            contract,
        );
    }

    timestampBelowAndNonceEquals(
        fn: FunctionFragment,
        data: CallArguments,
        contract: string,
    ): PredicateFn {
        const {
            address,
            nonce,
            timestamp,
        } = unpackTimestampAndNoncePredicate(
            data.timeNonceAccount.toHexString(),
            false,
        );

        return new PredicateFn(
            fn.name,
            {
                timestamp: new PredicateBytes(timestamp.toString(), contract),
                address: new PredicateBytes(address, contract),
                nonce: new PredicateBytes(nonce.toString(), contract),
            },
            contract,
        );
    }

    nonceEquals(fn: FunctionFragment, data: CallArguments, contract: string): PredicateFn {
        return new PredicateFn(
            fn.name,
            {
                makerAddress: new PredicateBytes(data.makerAddress, contract),
                nonce: new PredicateBytes(data.makerNonce.toHexString(), contract),
            },
            contract,
        );
    }

    nonce(fn: FunctionFragment, data: CallArguments, contract: string): PredicateFn {
        return new PredicateFn(
            fn.name,
            {
                makerAddress: new PredicateBytes(data[0], contract),
            },
            contract,
        );
    }

    private logicalDecoder(
        fn: FunctionFragment,
        data: CallArguments,
        contract: string,
    ): PredicateFn {
        const args = LimitOrderDecoder.unpackStaticCalls(data.offsets, data.data);

        return new PredicateFn(
            fn.name,
            args.map(calldata => new DecodableCall(calldata, contract)),
            contract,
        )
    }

            
    private comparingDecoder(
        fn: FunctionFragment,
        data: CallArguments,
        contract: string,
    ): PredicateFn {
        return new PredicateFn(
            fn.name,
            {
                value: new PredicateBytes(data.value.toString(), contract),
                data: new DecodableCall(data.data, contract),
            },
            contract,
        )
    }
}