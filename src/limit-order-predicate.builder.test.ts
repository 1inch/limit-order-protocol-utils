import Web3 from 'web3';
import {Web3ProviderConnector} from './connector/web3-provider.connector';
import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import {
    LimitOrderPredicateBuilder,
    LimitOrderPredicateCallData,
} from './limit-order-predicate.builder';
import {Erc20Facade} from './erc20.facade';
import {
    COMPLEX_PREDICATE_SNAPSHOT,
    SIMPLE_PREDICATE_SNAPSHOT,
} from '../test/predicate-snapshots';

describe('PredicateBuilder - for build limit order predicate', () => {
    const contractAddress = '0x0e6b8845f6a316f92efbaf30af21ff9e78f0008f';
    const walletAddress = '0xfb3c7eb936caa12b5a884d612393969a557d4307';
    const WBNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

    const web3 = new Web3('https://bsc-node.1inch.exchange');
    const providerConnector = new Web3ProviderConnector(web3);

    let facade: LimitOrderProtocolFacade;
    let predicateBuilder: LimitOrderPredicateBuilder;
    let erc20Facade: Erc20Facade;

    function buildComplexPredicate(): {
        valuesInPredicate: string[];
        predicate: LimitOrderPredicateCallData;
    } {
        const balanceOfCallData = erc20Facade.balanceOf(
            WBNB_ADDRESS,
            walletAddress
        );

        const timestampBelow1 = 1619860038;
        const nonce1 = 13344354354;
        const gt1 = 245673600000000000;
        const timestampBelow2 = 1619875555;
        const lt1 = 3453466520000000000;
        const eq1 = 34643434200000000;

        const valuesInPredicate = [
            timestampBelow1.toString(16),
            nonce1.toString(16),
            gt1.toString(16),
            timestampBelow2.toString(16),
            lt1.toString(16),
            eq1.toString(16),
        ];

        const {
            or,
            and,
            timestampBelow,
            nonceEquals,
            gt,
            lt,
            eq,
        } = predicateBuilder;

        const predicate = or(
            and(
                timestampBelow(timestampBelow1),
                nonceEquals(walletAddress, nonce1),
                gt(gt1.toString(), WBNB_ADDRESS, balanceOfCallData)
            ),
            or(
                timestampBelow(timestampBelow2),
                lt(lt1.toString(), WBNB_ADDRESS, balanceOfCallData)
            ),
            eq(eq1.toString(), WBNB_ADDRESS, balanceOfCallData)
        );

        return {valuesInPredicate, predicate};
    }

    beforeEach(() => {
        facade = new LimitOrderProtocolFacade(
            contractAddress,
            providerConnector
        );
        erc20Facade = new Erc20Facade(providerConnector);
        predicateBuilder = new LimitOrderPredicateBuilder(facade);
    });

    it('Simple predicate must includes all values and match the snapshot', () => {
        const nonce = 13;
        const timestampBelow = 1619860038;

        const valuesInPredicate = [
            nonce.toString(16),
            timestampBelow.toString(16),
        ];

        const predicate = predicateBuilder.and(
            predicateBuilder.nonceEquals(walletAddress, nonce),
            predicateBuilder.timestampBelow(timestampBelow)
        );

        const allValuesCheck = valuesInPredicate.every((value) =>
            predicate.includes(value)
        );

        expect(predicate).toBe(SIMPLE_PREDICATE_SNAPSHOT.join(''));
        expect(allValuesCheck).toBe(true);
    });

    it('Complex predicate must includes all values and match the snapshot', () => {
        const {valuesInPredicate, predicate} = buildComplexPredicate();

        const allValuesCheck = valuesInPredicate.every((value) =>
            predicate.includes(value)
        );

        expect(predicate).toBe(COMPLEX_PREDICATE_SNAPSHOT.join(''));
        expect(allValuesCheck).toBe(true);
    });

    it('When predicate includes all values in order then check must be true', () => {
        const {valuesInPredicate, predicate} = buildComplexPredicate();

        const allValuesInProperOrder = valuesInPredicate.every(
            (value, index) => {
                const inOrder =
                    predicate.indexOf(valuesInPredicate[index - 1]) <
                    predicate.indexOf(value);

                return index === 0 ? true : inOrder;
            }
        );

        expect(allValuesInProperOrder).toBe(true);
    });

    it('When predicate includes values not in order then check must be false', () => {
        const {valuesInPredicate, predicate} = buildComplexPredicate();
        const firstElement = valuesInPredicate[0];

        // Swap values places
        valuesInPredicate[0] = valuesInPredicate[1];
        valuesInPredicate[1] = firstElement;

        const allValuesInProperOrder = valuesInPredicate.every(
            (value, index) => {
                const inOrder =
                    predicate.indexOf(valuesInPredicate[index - 1]) <
                    predicate.indexOf(value);

                return index === 0 ? true : inOrder;
            }
        );

        expect(allValuesInProperOrder).toBe(false);
    });
});
