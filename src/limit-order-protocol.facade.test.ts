import {Web3ProviderConnector} from './connector/web3-provider.connector';
import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import Web3 from 'web3';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
} from './model/limit-order-protocol.model';
import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrderPredicateBuilder} from './limit-order-predicate.builder';

describe('LimitOrderProtocolFacade - facade for Limit order protocol contract', () => {
    const contractAddress = '0x0e6b8845f6a316f92efbaf30af21ff9e78f0008f';
    const walletAddress = '0xfb3c7eb936cAA12B5A884d612393969A557d4307';
    const chainId = 56;
    const web3 = new Web3('https://bsc-node.1inch.exchange');
    const providerConnector = new Web3ProviderConnector(web3);

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

    it('checkPredicate() when order predicates are valid then return true', async () => {
        const timestamp = Math.floor(Date.now() / 1000) + 600;
        const timestampBelow = limitOrderPredicateBuilder.timestampBelow(
            timestamp
        ); // valid value
        const predicate = await limitOrderPredicateBuilder.and(timestampBelow);

        const order = createOrderWithPredicate(predicate);

        const result = await facade.checkPredicate(order);

        expect(result).toBe(true);
    });

    it('checkPredicate() when order predicates are NOT valid then return false', async () => {
        const timestampBelow = facade.getContractCallData(
            LimitOrderProtocolMethods.timestampBelow,
            [12000000] // must be 0x0000...
        );
        const predicate = await limitOrderPredicateBuilder.and(timestampBelow);

        const order = createOrderWithPredicate(predicate);

        const result = await facade.checkPredicate(order);

        expect(result).toBe(false);
    });

    it('simulateTransferFroms() when order is invalid by nonce predicate then must return false', async () => {
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

    it('simulateTransferFroms() when order is invalid by timestamp predicate then must return false', async () => {
        const timestamp = Math.floor(Date.now() / 1000) - 100; // invalid value
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

    it('simulateTransferFroms() when order is valid by all predicates then must return true', async () => {
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
