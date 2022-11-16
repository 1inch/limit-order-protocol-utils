import { Nonce, PredicateTimestamp } from "./model/limit-order-protocol.model";
import { Series, SeriesNonceManagerMethods } from "./model/series-nonce-manager.model";
import { AbstractPredicateBuilder } from "./utils/abstract-predicate-builder";
import { SeriesNonceManagerFacade } from "./series-nonce-manager.facade";
import { ZX } from "./limit-order-protocol.const";
import { assertSeries } from "./utils/series-nonce-manager.utils";

/**
 * All methods is lambdas to preserve `this` context and allow DSL-like usage
 */
export class SeriesNonceManagerPredicateBuilder
    extends AbstractPredicateBuilder<SeriesNonceManagerFacade>
{
    nonce = (series: Series, makerAddress: string): string => {
        assertSeries(series);

        return this.facade.getContractCallData(
            SeriesNonceManagerMethods.nonce,
            [series, makerAddress],
        );
    }

    nonceEquals = (
        series: Series,
        makerAddress: string,
        makerNonce: Nonce,
    ): string => {
        assertSeries(series);

        return this.facade.getContractCallData(
            SeriesNonceManagerMethods.nonceEquals,
            [series, makerAddress, makerNonce],
        );
    }

    timestampBelowAndNonceEquals = (
        series: Series,
        timestamp: PredicateTimestamp,
        makerNonce: Nonce,
        makerAddress: string,
    ): string => {
        assertSeries(series);
        
        const predicateValue = BigInt(makerAddress)
            + (BigInt(series) << BigInt(160))
            + (BigInt(makerNonce) << BigInt(160 + 16))
            + (BigInt(timestamp) << BigInt(160 + 16 + 40));

        return this.facade.getContractCallData(
            SeriesNonceManagerMethods.timestampBelowAndNonceEquals,
            [ZX + predicateValue.toString(16)],
        );
    }
}