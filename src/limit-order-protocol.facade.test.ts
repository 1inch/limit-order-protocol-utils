import {ErrorResponse, LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import {
    ChainId,
    LimitOrder,
    LimitOrderProtocolMethods,
} from './model/limit-order-protocol.model';
import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrderPredicateBuilder} from './limit-order-predicate.builder';
import {BETA_CONTRACT_ADDRESSES, mocksForChain} from './test/helpers';
import { LimitOrderDecoder } from './limit-order.decoder';

class TestErrorResponse extends Error implements ErrorResponse {
    data: string;
    
    constructor(message: string, result: string) {
        super(message);
        this.data = result;
    }
}

// eslint-disable-next-line max-lines-per-function
describe('LimitOrderProtocolFacade - facade for Limit order protocol contract', () => {
    const walletAddress = '0xfb3c7eb936cAA12B5A884d612393969A557d4307';

    let facade: LimitOrderProtocolFacade;
    let contractAddress: string;
    let limitOrderPredicateBuilder: LimitOrderPredicateBuilder;
    let limitOrderBuilder: LimitOrderBuilder;

    function createOrderWithPredicate(predicate: string): LimitOrder {
        return limitOrderBuilder.buildLimitOrder({
            makerAssetAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
            makerAddress: walletAddress,
            makingAmount: '1000000000000000000',
            takingAmount: '1000000000000000000',
            predicate,
        });
    }

    beforeEach(() => {
        const chainId = ChainId.etherumMainnet;
        
        const mocks = mocksForChain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
        facade = mocks.facade;
        limitOrderBuilder = mocks.limitOrderBuilder;
        limitOrderPredicateBuilder = mocks.limitOrderPredicateBuilder;
        contractAddress = mocks.contractAddress;

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
            const makingAmount = '1000000000000000000';
            const takingAmount = '0';
            const thresholdAmount = '0';

            const callData = facade.fillLimitOrder({
                order,
                signature,
                makingAmount,
                takingAmount,
                thresholdAmount,
                skipPermit: false,
            });

            expect(callData).toMatchSnapshot();
        });
    });

    describe('fillOrderToWithPermit()', () => {
        it('Must create a call data for order filling with permit', async () => {
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
            const makingAmount = '1000000000000000000';
            const takingAmount = '0';
            const thresholdAmount = '0';
            const permit = '242342334320324';
            const targetAddress = walletAddress;

            const callData = facade.fillOrderToWithPermit({
                order,
                signature,
                makingAmount,
                takingAmount,
                thresholdAmount,
                skipPermit: false,
                permit,
                targetAddress,
            });

            expect(callData).toMatchSnapshot();
        });
    });

    describe('fillRFQOrder()', () => {
        it('Must create a call data for RFQ order filling', async () => {
            const order = limitOrderBuilder.buildRFQOrder({
                id: 2,
                expiresInTimestamp: 1623166102,
                makerAddress: '0x96577468b160184347e16340a80a9e81c132b967',
                allowedSender: '0x9741db81f7b3b23ef66f285ed5c7dc2cb94b601e',
                makerAssetAddress: '0xae6c77d06226742a333a6d2991fe3331889c09a6',
                takerAssetAddress: '0x49feb353fdf1d396a959973216cbac10ef11e7bf',
                makingAmount: '1000000000000000000',
                takingAmount: '6500000000000000000',
            });

            const typedData = limitOrderBuilder.buildRFQOrderTypedData(order);
            const signature = await limitOrderBuilder.buildOrderSignature(
                walletAddress,
                typedData
            );
            const makingAmount = '1000000000000000000';
            const takingAmount = '0';

            const callData = facade.fillRFQOrder(
                order,
                signature,
                makingAmount,
                takingAmount
            );

            expect(callData).toMatchSnapshot();
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

            expect(callData).toMatchSnapshot();
        });
    });

    describe('cancelRFQOrder()', () => {
        it('Must create a call data for order canceling', async () => {
            const order = limitOrderBuilder.buildRFQOrder({
                id: 2,
                expiresInTimestamp: 1623166102,
                makerAddress: '0x96577468b160184347e16340a80a9e81c132b967',
                allowedSender: '0x9741db81f7b3b23ef66f285ed5c7dc2cb94b601e',
                makerAssetAddress: '0xae6c77d06226742a333a6d2991fe3331889c09a6',
                takerAssetAddress: '0x49feb353fdf1d396a959973216cbac10ef11e7bf',
                makingAmount: '1000000000000000000',
                takingAmount: '6500000000000000000',
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
                '0x401394cd75d731e07658203fff34722a68316fca'
            );

            expect(nonce).toBe(1n);
        });

        it('Return 0 when address never called advanceNonce (for contract address)', async () => {
            const nonce = await facade.nonce(contractAddress);

            expect(nonce).toBe(0n);
        });

        it('Valid zero nonce on Aurora', async () => {
            const chainId = ChainId.auroraMainnet;
            const mocks = mocksForChain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
            facade = mocks.facade;
        
            const nonce = await facade.nonce(walletAddress);

            expect(nonce).toBe(0n);
        });

        it('Valid non-zero nonce on Aurora', async () => {
            const chainId = ChainId.auroraMainnet;
            const mocks = mocksForChain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
            facade = mocks.facade;
        
            const walletAddress = '0x401394CD75D731e07658203fFF34722A68316FCa';
            const nonce = await facade.nonce(walletAddress); // real nonce

            expect(nonce).toBe(1n);
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

            let error: ErrorResponse | null = null;

            try {
                await facade.remaining(orderHash);
            } catch (e) {
                error = e;
            }

            expect(error?.data).toBe('0xb838de96'); // UnknownOrder()
        });

        /**
         * @TODO create tx
         */
        it.skip('When order is partially filled, then must return remaining amount', async () => {
            // Order 1INCH > DAI, filled for 40%:
            // https://bscscan.com/tx/0x094d5b48570faa28205d5619980a1eba2d27a0edbbb177ba1b24dc72069c4fd6
            const orderHash =
                '0x81c1c187d866c1fdca1d50b9cf4b8a9cbef7211d1adb7d8c5412980d85f4ed6f';

            const remaining = await facade.remaining(orderHash);

            expect(remaining.toString()).toBe('300000000000000000');
        });

        /**
         * @TODO create tx
         */
        it.skip('When order is canceled, then must return zero', async () => {
            // Canceled order
            const orderHash =
                '0x088c329bd399a43b11986f8f873913789bae70ba6860949db094c935b81e975b';

            const remaining = await facade.remaining(orderHash);

            expect(remaining.toString()).toBe('0');
        });

        it('When order is comletely filled, then must return zero', async () => {
            const orderHash =
                '0xeee602fc37ab84704001080c24461473143faba8b4ab60036fc9235f0cb98643';

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
                '0x000',
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
                nonce + 1n,
            ); // invalid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const result1 = await facade.simulate(contractAddress, predicate);
            const makerAssetData = LimitOrderDecoder.unpackInteraction(order, 'makerAssetData');
            const result2 = await facade.simulate(walletAddress, makerAssetData);

            expect(result1).toMatchObject({
                success: false,
                rawResult: '0x0000000000000000000000000000000000000000000000000000000000000000',
            });
            expect(result2).toMatchObject({
                success: true,
                rawResult: null,
            });
        });

        it('When an order is invalid by the timestamp predicate then must return false', async () => {
            const timestamp = Math.floor(Date.now() / 1000) - 100000; // invalid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonce(walletAddress); // real nonce
            const nonceEquals = limitOrderPredicateBuilder.nonceEquals(
                walletAddress,
                nonce,
            ); // valid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const result1 = await facade.simulate(contractAddress, predicate);
            const makerAssetData = LimitOrderDecoder.unpackInteraction(order, 'makerAssetData');
            const result2 = await facade.simulate(walletAddress, makerAssetData);

            expect(result1).toMatchObject({
                success: false,
                rawResult: '0x0000000000000000000000000000000000000000000000000000000000000000',
            });
            expect(result2).toMatchObject({
                success: true,
                rawResult: null,
            });
        });

        it('When an order is valid by all predicates then must return true', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 100; // valid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonce(walletAddress); // real nonce
            const nonceEquals = limitOrderPredicateBuilder.nonceEquals(
                walletAddress,
                nonce,
            ); // valid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const result1 = await facade.simulate(contractAddress, predicate);
            const makerAssetData = LimitOrderDecoder.unpackInteraction(order, 'makerAssetData');
            const result2 = await facade.simulate(walletAddress, makerAssetData);

            expect(result1).toMatchObject({
                success: true,
                rawResult: '0x0000000000000000000000000000000000000000000000000000000000000001',
            });
            expect(result2).toMatchObject({
                success: true,
                rawResult: null,
            });
        });

        it('Valid predicates on Aurora then must return true', async () => {
            const chainId = ChainId.auroraMainnet;
            const mocks = mocksForChain(chainId);
            facade = mocks.facade;
            limitOrderBuilder = mocks.limitOrderBuilder;
            limitOrderPredicateBuilder = mocks.limitOrderPredicateBuilder;
            contractAddress = mocks.contractAddress;

            const timestamp = Math.floor(Date.now() / 1000) + 100; // valid value
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const nonce = await facade.nonce(walletAddress); // real nonce
            const nonceEquals = limitOrderPredicateBuilder.nonceEquals(
                walletAddress,
                nonce,
            ); // valid value

            const predicate = await limitOrderPredicateBuilder.and(
                timestampBelow,
                nonceEquals
            );
            const order = createOrderWithPredicate(predicate);

            const result1 = await facade.simulate(contractAddress, predicate);
            const makerAssetData = LimitOrderDecoder.unpackInteraction(order, 'makerAssetData');
            const result2 = await facade.simulate(walletAddress, makerAssetData);

            expect(result1).toMatchObject({
                success: true,
                rawResult: '0x0000000000000000000000000000000000000000000000000000000000000001',
            });
            expect(result2).toMatchObject({
                success: true,
                rawResult: null,
            });
        });
    });

    it('domainSeparator() return domain separator (used for signing typed data by Ledger)', async () => {
        const { facade } = mocksForChain(1, '0x9b934b33fef7a899f502bc191e820ae655797ed3');
        const result = await facade.domainSeparator();

        expect(result).toBe(
            '0x36c0393c32224111f2ce6aef4b834b75ac4358b6fdee79412680cf7c713dbb6a'
        );
    });

    it("parseSimulateTransferError() return false when simulation call failed", () => {
        // no data in result
        const input = new Error('Error: execution reverted');

        const result = facade.parseSimulateTransferError(input as ErrorResponse);

        expect(result).toBeNull();
    });

    it("parseSimulateTransferError() when result isn't returned", () => {
        const input = new TestErrorResponse(
            'Returned error: execution reverted',
            // eslint-disable-next-line max-len
            '0x1934afc8000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
        );
        const result = facade.parseSimulateTransferError(input);

        expect(result).toMatchObject({
            success: true,
            rawResult: null,
        });
    });

    it("parseSimulateTransferError() when false-like result is returned", () => {
        const input = new TestErrorResponse(
            'Returned error: execution reverted',
            // eslint-disable-next-line max-len
            '0x1934afc80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        );
        const result = facade.parseSimulateTransferError(input);

        expect(result).toMatchObject({
            success: false,
            rawResult: '0x0000000000000000000000000000000000000000000000000000000000000000',
        });
    });

    it("parseSimulateTransferError() when true-like result is returned", () => {
        const input = new TestErrorResponse(
            'Returned error: execution reverted',
            // eslint-disable-next-line max-len
            '0x1934afc80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001',
        );
        const result = facade.parseSimulateTransferError(input);

        expect(result).toMatchObject({
            success: true,
        });
    });
});
