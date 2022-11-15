import {
    CallArguments,
    DecodersImplementation,
    PredicateBytes,
    PredicateFn,
} from "../../limit-order-predicate.decoder";
import { FunctionFragment } from "@ethersproject/abi";
import { unpackTimestampAndNoncePredicate } from "../limit-order.utils";
import { Series } from "../../model/series-nonce-manager.model";


export class SeriesNonceManagerDecoders
    implements DecodersImplementation<SeriesNonceManagerDecoders>
{

    timestampBelowAndNonceEquals(
        fn: FunctionFragment,
        data: CallArguments,
        contract: string,
    ): PredicateFn {
        const {
            address,
            nonce,
            series,
            timestamp,
        } = unpackTimestampAndNoncePredicate(
            data.timeNonceSeriesAccount.toHexString(),
            true,
        );

        return new PredicateFn(
            fn.name,
            {
                series: new PredicateBytes((series as Series).toString(), contract),
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
                makerNonce: new PredicateBytes(data.makerNonce.toHexString(), contract),
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
}