import { NonceSeriesV2, Series } from "../model/series-nonce-manager.model";

export function assertSeries(series: Series): void {
    if (series === NonceSeriesV2._GaslessV3) {
        throw new TypeError(
            'SeriesNonceManagerPredicateBuilder is unnecessary for Gasless. '
            + 'Use LimitOrderPredicateBuilder.',
        );
    }
    
    if (series < 0) {
        throw new RangeError('Series should be valid value and greater than zero. Check the docs.');
    }
}