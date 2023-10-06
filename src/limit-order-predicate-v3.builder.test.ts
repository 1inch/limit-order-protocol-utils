import { ChainId } from './model/limit-order-protocol.model';
import {mocksForV3Chain} from './test/helpers';
import {LimitOrderPredicateV3Builder} from "./limit-order-predicate-v3.builder";

describe('PredicateBuilderV3 - for build limit order v3 predicate', () => {
    const chainId = ChainId.binanceMainnet;
    const walletAddress = '0xfb3c7eb936caa12b5a884d612393969a557d4307';

    let predicateBuilder: LimitOrderPredicateV3Builder;

    beforeEach(() => {
        const mocks = mocksForV3Chain(chainId);
        predicateBuilder = mocks.limitOrderPredicateBuilder;
    });

    it('Simple predicate must includes all values and match the snapshot', () => {
        const timestampBelow = 1619860038;

        const valuesInPredicate = [
            timestampBelow.toString(16),
        ];

        const predicate = predicateBuilder.timestampBelow(timestampBelow);

        const allValuesCheck = valuesInPredicate.every((value) =>
            predicate.includes(value)
        );

        expect(predicate).toMatchSnapshot();
        expect(allValuesCheck).toBe(true);
    });

    it('Simplyfied predicate must includes all values and match the snapshot', () => {
        const nonce = 14;
        const timestampBelow = 1619860038;

        const valuesInPredicate = [
            nonce.toString(16),
            timestampBelow.toString(16),
        ];

        const predicate = predicateBuilder.timestampBelowAndNonceEquals(
            timestampBelow,
            nonce,
            walletAddress,
        );

        const allValuesCheck = valuesInPredicate.every((value) =>
            predicate.includes(value)
        );

        expect(predicate).toMatchSnapshot();
        expect(allValuesCheck).toBe(true);
    });
});
