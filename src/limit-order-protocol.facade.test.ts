import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import Web3 from 'web3';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
} from './model/limit-order-protocol.model';
import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrderPredicateBuilder} from './limit-order-predicate.builder';
import {FILL_ORDER_SNAPSHOT} from '../test/fill-order-sanpshot';
import {CANCEL_ORDER_SNAPSHOT} from '../test/cancel-order-snapshot';
import {FILL_RFQ_ORDER_SNAPSHOT} from '../test/fill-order-rfq-snapshot';
import {PrivateKeyProviderConnector} from './connector/private-key-provider.connector';

describe('LimitOrderProtocolFacade - facade for Limit order protocol contract', () => {
    const contractAddress = '0xe3456f4ee65e745a44ec3bcb83d0f2529d1b84eb';
    const walletAddress = '0xfb3c7eb936cAA12B5A884d612393969A557d4307';
    const chainId = 56;

    const privateKey =
        '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc';
    const web3 = new Web3('https://bsc-dataseed.binance.org');

    let providerConnector: PrivateKeyProviderConnector;
    let facade: LimitOrderProtocolFacade;
    let limitOrderPredicateBuilder: LimitOrderPredicateBuilder;
    let limitOrderBuilder: LimitOrderBuilder;

    function createOrderWithPredicate(predicate: string): LimitOrder {
        return limitOrderBuilder.buildLimitOrder({
            makerAssetAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
            makerAddress: walletAddress,
            makerAmount: '1000000000000000000',
            takerAmount: '1000000000000000000',
            predicate,
        });
    }

    beforeEach(() => {
        providerConnector = new PrivateKeyProviderConnector(privateKey, web3);

        facade = new LimitOrderProtocolFacade(
            contractAddress,
            providerConnector
        );

        limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(facade);

        limitOrderBuilder = new LimitOrderBuilder(
            contractAddress,
            chainId,
            providerConnector
        );

        jest.spyOn(console, 'error').mockImplementation();
    });

    describe('fillLimitOrder()', () => {
        it('Must create a call data for order filling', async () => {
            const timestamp = 1621040104;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            );
            const order = createOrderWithPredicate(timestampBelow);

            order.salt = '1';

            const typedData = limitOrderBuilder.buildLimitOrderTypedData(order);
            const signature = await limitOrderBuilder.buildOrderSignature(
                walletAddress,
                typedData
            );
            const makerAmount = '1000000000000000000';
            const takerAmount = '0';
            const thresholdAmount = '0';

            const callData = facade.fillLimitOrder(
                order,
                signature,
                makerAmount,
                takerAmount,
                thresholdAmount
            );

            expect(callData).toBe(FILL_ORDER_SNAPSHOT);
        });
    });

    describe('fillRFQOrder()', () => {
        it('Must create a call data for RFQ order filling', async () => {
            const order = limitOrderBuilder.buildRFQOrder({
                id: 2,
                expiresInTimestamp: 1623166102,
                makerAddress: '0x96577468b160184347e16340a80a9e81c132b967',
                takerAddress: '0x9741db81f7b3b23ef66f285ed5c7dc2cb94b601e',
                destReceiver: '0x9741db81f7b3b23ef66f285ed5c7dc2cb94b601e',
                makerAssetAddress: '0xae6c77d06226742a333a6d2991fe3331889c09a6',
                takerAssetAddress: '0x49feb353fdf1d396a959973216cbac10ef11e7bf',
                makerAmount: '1000000000000000000',
                takerAmount: '6500000000000000000',
            });

            const typedData = limitOrderBuilder.buildRFQOrderTypedData(order);
            const signature = await limitOrderBuilder.buildOrderSignature(
                walletAddress,
                typedData
            );
            const makerAmount = '1000000000000000000';
            const takerAmount = '0';

            const callData = facade.fillRFQOrder(
                order,
                signature,
                makerAmount,
                takerAmount
            );

            expect(callData).toBe(FILL_RFQ_ORDER_SNAPSHOT);
        });
    });

    describe('cancelLimitOrder()', () => {
        it('Must create a call data for order canceling', async () => {
            const timestamp = 1621040104;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            );
            const order = createOrderWithPredicate(timestampBelow);

            order.salt = '1';

            const callData = facade.cancelLimitOrder(order);

            expect(callData).toBe(CANCEL_ORDER_SNAPSHOT);
        });
    });

    describe('cancelRFQOrder()', () => {
        it('Must create a call data for order canceling', async () => {
            const order = limitOrderBuilder.buildRFQOrder({
                id: 2,
                expiresInTimestamp: 1623166102,
                makerAddress: '0x96577468b160184347e16340a80a9e81c132b967',
                takerAddress: '0x9741db81f7b3b23ef66f285ed5c7dc2cb94b601e',
                destReceiver: '0x9741db81f7b3b23ef66f285ed5c7dc2cb94b601e',
                makerAssetAddress: '0xae6c77d06226742a333a6d2991fe3331889c09a6',
                takerAssetAddress: '0x49feb353fdf1d396a959973216cbac10ef11e7bf',
                makerAmount: '1000000000000000000',
                takerAmount: '6500000000000000000',
            });

            const callData = facade.cancelRFQOrder(order.info);

            expect(callData).toBe(
                '0x825caba1000000000000000000000000000000000000000060bf8c960000000000000002'
            );
        });
    });

    describe('nonce()', () => {
        it('Return the nonce number of address (for real wallet address)', async () => {
            const nonce = await facade.nonce(
                '0xbbcf91605c18a9859c1d47abfeed5d2cca7097cf'
            );

            expect(nonce).toBeGreaterThan(1);
        });

        it('Return 0 when address never called advanceNonce (for contract address)', async () => {
            const nonce = await facade.nonce(contractAddress);

            expect(nonce).toBe(0);
        });
    });

    describe('advanceNonce()', () => {
        it('Must create a call data for advance nonce', async () => {
            const callData = await facade.advanceNonce(2);

            expect(callData).toBe(
                '0x72c244a80000000000000000000000000000000000000000000000000000000000000002'
            );
        });
    });

    describe('increaseNonce()', () => {
        it('Must create a call data for increase nonce', async () => {
            const callData = await facade.increaseNonce();

            expect(callData).toBe('0xc53a0292');
        });
    });

    describe('remaining()', () => {
        it('When order is never been touched, then must throw error', async () => {
            const order = createOrderWithPredicate('0x');
            const orderTypedData = limitOrderBuilder.buildLimitOrderTypedData(
                order
            );
            const orderHash = limitOrderBuilder.buildLimitOrderHash(
                orderTypedData
            );

            let error = null;

            try {
                await facade.remaining(orderHash);
            } catch (e) {
                error = e;
            }

            expect(error?.message?.includes('LOP: Unknown order')).toBe(true);
        });

        it('When order is partially filled, then must return remaining amount', async () => {
            // Order WBNB > 1INCH, filled for 3%
            const orderHash =
                '0x969ecf29e9b02b15e9640a6c741ea2db7984a00843485e0ed6aa4638e6860838';

            const remaining = await facade.remaining(orderHash);

            expect(remaining.toString()).toBe('2917591702620370');
        });

        it('When order is canceled, then must return zero', async () => {
            // Canceled order
            const orderHash =
                '0x44579da3014205b53cafe1badd3a4e8327d769560a0f38efd9840c402670312c';

            const remaining = await facade.remaining(orderHash);

            expect(remaining.toString()).toBe('0');
        });
    });

    describe('checkPredicate()', () => {
        it('When the order predicates are valid then return true', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 600;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow
            );

            const order = createOrderWithPredicate(predicate);

            const result = await facade.checkPredicate(order);

            expect(result).toBe(true);
        });

        it('When the order predicates are NOT valid then return false', async () => {
            const timestampBelow = facade.getContractCallData(
                LimitOrderProtocolMethods.timestampBelow,
                [12000000] // must be 0x0000...
            );
            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow
            );

            const order = createOrderWithPredicate(predicate);

            const result = await facade.checkPredicate(order);

            expect(result).toBe(false);
        });

        it('When provider returns invalid value, then return false', async () => {
            const predicate = await limitOrderPredicateBuilder.eq(
                '1',
                walletAddress,
                '0x000'
            );

            const order = createOrderWithPredicate(predicate);

            const result = await facade.checkPredicate(order);

            expect(result).toBe(false);
        });
    });

    describe('simulateCalls()', () => {
        it('When an order is invalid by the nonce predicate then must return false', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonce(walletAddress); // real nonce
            const nonceEquals = limitOrderPredicateBuilder.nonceEquals(
                walletAddress,
                nonce + 1
            ); // invalid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const tokens = [contractAddress, walletAddress];
            const data = [order.predicate, order.makerAssetData];

            const result = await facade.simulateCalls(tokens, data);

            expect(result).toBe(false);
        });

        it('When an order is invalid by the timestamp predicate then must return false', async () => {
            const timestamp = Math.floor(Date.now() / 1000) - 100000; // invalid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonce(walletAddress); // real nonce
            const nonceEquals = limitOrderPredicateBuilder.nonceEquals(
                walletAddress,
                nonce
            ); // valid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const tokens = [contractAddress, walletAddress];
            const data = [order.predicate, order.makerAssetData];

            const result = await facade.simulateCalls(tokens, data);

            expect(result).toBe(false);
        });

        it('When an order is valid by all predicates then must return true', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 100; // valid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonce(walletAddress); // real nonce
            const nonceEquals = limitOrderPredicateBuilder.nonceEquals(
                walletAddress,
                nonce
            ); // valid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const tokens = [contractAddress, walletAddress];
            const data = [order.predicate, order.makerAssetData];

            const result = await facade.simulateCalls(tokens, data);

            expect(result).toBe(true);
        });
    });

    it('domainSeparator() return domain separator (used for signing typed data by Ledger)', async () => {
        const result = await facade.domainSeparator();

        expect(result).toBe(
            '0xc01dba435cd14ffa0d760af4ffb49214bf6c739da021e8377adedcb4c4db47e8'
        );
    });

    it("parseSimulateTransferResponse() return null when response doesn't contain special prefix", () => {
        const input =
            '1111111111' +
            '000000000000000000000000000000000000000000000000000000000000002' +
            '000000000000000000000000000000000000000000000000000000000000000' +
            '124c4f503a20556e6b6e6f776e206f726465720000000000000000000000000000';

        const result = facade.parseSimulateTransferResponse(input);

        expect(result).toBe(null);
    });

    it("parseSimulateTransferError() return null when response doesn't contain special prefix", () => {
        const input = 'dddddddddd';
        const result = facade.parseSimulateTransferError(input);

        expect(result).toBe(null);
    });

    it("parseSimulateTransferError() return true when response doesn't contain any zero chars", () => {
        const input = 'CALL_RESULTS_11';
        const result = facade.parseSimulateTransferError(input);

        expect(result).toBe(true);
    });

    it('parseSimulateTransferError() return false when response contain zero chars', () => {
        const input = 'CALL_RESULTS_01';
        const result = facade.parseSimulateTransferError(input);

        expect(result).toBe(false);
    });
});
