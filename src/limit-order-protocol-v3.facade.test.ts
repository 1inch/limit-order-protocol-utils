import {
    ChainId,
    LimitOrderLegacy,
    LimitOrderProtocolMethodsV3,
} from './model/limit-order-protocol.model';
import {LimitOrderBuilder} from './limit-order.builder';
import {BETA_CONTRACT_ADDRESSES, mocksForV3Chain} from './test/helpers';
import {LimitOrderProtocolV3Facade} from "./limit-order-protocol-v3.facade";
import {LimitOrderPredicateV3Builder} from "./limit-order-predicate-v3.builder";


// eslint-disable-next-line max-lines-per-function
describe('LimitOrderProtocolV3Facade - facade for Limit order protocol contract', () => {
    const walletAddress = '0xfb3c7eb936cAA12B5A884d612393969A557d4307';

    let facade: LimitOrderProtocolV3Facade;
    let contractAddress: string;
    let limitOrderPredicateBuilder: LimitOrderPredicateV3Builder;
    let limitOrderBuilder: LimitOrderBuilder;

    function createOrderWithPredicate(predicate: string): LimitOrderLegacy {
        return limitOrderBuilder.buildLegacyLimitOrder({
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

        const mocks = mocksForV3Chain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
        facade = mocks.facade;
        limitOrderBuilder = mocks.limitOrderBuilder;
        limitOrderPredicateBuilder = mocks.limitOrderPredicateBuilder;
        contractAddress = mocks.contractAddress;

        jest.spyOn(console, 'error').mockImplementation();
    });

    describe('cancelLimitOrder', () => {
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
            const mocks = mocksForV3Chain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
            facade = mocks.facade;

            const nonce = await facade.nonce(walletAddress);

            expect(nonce).toBe(0n);
        });

        it('Valid non-zero nonce on Aurora', async () => {
            const chainId = ChainId.auroraMainnet;
            const mocks = mocksForV3Chain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
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

    describe('checkPredicate()', () => {
        it('When the order predicates are valid then return true', async () => {
            const timestamp = Math.floor(Date.now() / 1000) + 600;
            const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
                timestamp
            ); // valid value
            const predicate = timestampBelow;

            const order = createOrderWithPredicate(predicate);

            const result = await facade.checkPredicate(order);

            expect(result).toBe(true);
        });

        it('When the order predicates are NOT valid then return false', async () => {
            const timestampBelow = facade.getContractCallData(
                LimitOrderProtocolMethodsV3.timestampBelow,
                [12000000] // must be 0x0000...
            );
            const predicate = timestampBelow;

            const order = createOrderWithPredicate(predicate);

            const result = await facade.checkPredicate(order);

            expect(result).toBe(false);
        });
    });
});
