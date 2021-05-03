import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import Web3 from 'web3';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
} from './model/limit-order-protocol.model';
import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrderPredicateBuilder} from './limit-order-predicate.builder';
import {FakeProviderConnector} from '../test/fake-provider.connector';
import {FILL_ORDER_SNAPSHOT} from '../test/fill-order-sanpshot';
import {CANCEL_ORDER_SNAPSHOT} from '../test/cancel-order-snapshot';

describe('LimitOrderProtocolFacade - facade for Limit order protocol contract', () => {
    const contractAddress = '0x0e6b8845f6a316f92efbaf30af21ff9e78f0008f';
    const walletAddress = '0xfb3c7eb936cAA12B5A884d612393969A557d4307';
    const chainId = 56;

    const privateKey =
        '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc';
    const web3 = new Web3('https://bsc-node.1inch.exchange');

    let providerConnector: FakeProviderConnector;
    let facade: LimitOrderProtocolFacade;
    let limitOrderPredicateBuilder: LimitOrderPredicateBuilder;
    let limitOrderBuilder: LimitOrderBuilder;

    function createOrderWithPredicate(predicate: string): LimitOrder {
        return limitOrderBuilder.buildOrder({
            makerAssetAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
            makerAddress: walletAddress,
            makerAmount: '1000000000000000000',
            takerAmount: '1000000000000000000',
            predicate,
        });
    }

    beforeEach(() => {
        providerConnector = new FakeProviderConnector(privateKey, web3);

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
    });

    describe('fillOrder()', () => {
        it('Must create a call data for order filling', async () => {
            const timestamp = 1621040104;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            );
            const order = createOrderWithPredicate(timestampBelow);

            order.salt = '1';

            const typedData = limitOrderBuilder.buildOrderTypedData(order);
            const signature = await limitOrderBuilder.buildOrderSignature(
                walletAddress,
                typedData
            );
            const makerAmount = '1000000000000000000';
            const takerAmount = '0';

            const callData = facade.fillOrder(
                order,
                signature,
                makerAmount,
                takerAmount
            );

            expect(callData).toBe(FILL_ORDER_SNAPSHOT);
        });
    });

    describe('cancelOrder()', () => {
        it('Must create a call data for order canceling', async () => {
            const timestamp = 1621040104;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            );
            const order = createOrderWithPredicate(timestampBelow);

            order.salt = '1';

            const callData = facade.cancelOrder(order);

            expect(callData).toBe(CANCEL_ORDER_SNAPSHOT);
        });
    });

    describe('nonces()', () => {
        it('Return the nonce number of address (for real wallet address)', async () => {
            const nonces = await facade.nonces(walletAddress);

            expect(nonces).toBeGreaterThan(12);
        });

        it('Return 0 when address never called advanceNonce (for contract address)', async () => {
            const nonces = await facade.nonces(contractAddress);

            expect(nonces).toBe(0);
        });
    });

    describe('advanceNonce()', () => {
        it('Must create a call data for advance nonce', async () => {
            const callData = await facade.advanceNonce();

            expect(callData).toBe('0x8faae2c2');
        });
    });

    describe('remaining()', () => {
        it('When order is never been touched, then must throw error', async () => {
            const order = createOrderWithPredicate('0x');
            const orderTypedData = limitOrderBuilder.buildOrderTypedData(order);
            const orderHash = limitOrderBuilder.buildOrderHash(orderTypedData);

            let error = null;

            try {
                await facade.remaining(orderHash);
            } catch (e) {
                error = e;
            }

            expect(error).toBe('LOP: Unknown order');
        });

        it('When order is partially filled, then must return remaining amount', async () => {
            // Order 1BUSD > 1 DAI, filled for 20%
            const orderHash =
                '0x5e887e6f651029455ce72384b0c02d8eb612db728c09617fd23d3fb834f705e6';

            const remaining = await facade.remaining(orderHash);

            expect(remaining.toString()).toBe('800000000000000000');
        });

        it('When order is canceled, then must return zero', async () => {
            // Canceled order
            const orderHash =
                '0xd522b08465386fb462676da9b923aea0df2085dc3b96695520203e6e4a46e5a8';

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

        it('When provider returns invalid value, then return true', async () => {
            const predicate = await limitOrderPredicateBuilder.eq(
                '1',
                walletAddress,
                '0x000'
            );

            const order = createOrderWithPredicate(predicate);

            console.log(
                'This is ok! Error "overflow (fault="overflow", operation="toNumber"..." must be shown!'
            );
            const result = await facade.checkPredicate(order);

            expect(result).toBe(false);
        });
    });

    describe('simulateTransferFroms()', () => {
        it('When an order is invalid by the nonce predicate then must return false', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonces(walletAddress); // real nonce
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

            const result = await facade.simulateTransferFroms(tokens, data);

            expect(result).toBe(false);
        });

        it('When an order is invalid by the timestamp predicate then must return false', async () => {
            const timestamp = Math.floor(Date.now() / 1000) - 100000; // invalid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonces(walletAddress); // real nonce
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

            const result = await facade.simulateTransferFroms(tokens, data);

            expect(result).toBe(false);
        });

        it('When an order is valid by all predicates then must return true', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 100; // valid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonces(walletAddress); // real nonce
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

            const result = await facade.simulateTransferFroms(tokens, data);

            expect(result).toBe(true);
        });
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
        const input = 'TRANSFERS_SUCCESSFUL_11';
        const result = facade.parseSimulateTransferError(input);

        expect(result).toBe(true);
    });

    it('parseSimulateTransferError() return false when response contain zero chars', () => {
        const input = 'TRANSFERS_SUCCESSFUL_01';
        const result = facade.parseSimulateTransferError(input);

        expect(result).toBe(false);
    });
});
