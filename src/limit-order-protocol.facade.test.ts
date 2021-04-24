import {Web3ProviderConnector} from './connector/web3-provider.connector';
import {LimitOrderProtocolFacade} from './limit-order-protocol.facade';
import Web3 from 'web3';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
} from './model/limit-order-protocol.model';
import {LimitOrderBuilder} from './limit-order.builder';

describe('LimitOrderProtocolFacade - facade for Limit order protocol contract', () => {
    const contractAddress = '0x0e6b8845f6a316f92efbaf30af21ff9e78f0008f';
    const chainId = 56;
    const web3 = new Web3('https://bsc-node.1inch.exchange');
    const providerConnector = new Web3ProviderConnector(web3);

    let limitOrderProtocolFacade: LimitOrderProtocolFacade;
    let limitOrderBuilder: LimitOrderBuilder;

    beforeEach(() => {
        limitOrderProtocolFacade = new LimitOrderProtocolFacade(
            contractAddress,
            providerConnector
        );

        limitOrderBuilder = new LimitOrderBuilder(
            contractAddress,
            chainId,
            providerConnector
        );
    });

    it('checkPredicate() when order predicates are valid then return true', async () => {
        const timestamp = Math.floor(Date.now() / 1000) + 600;
        const timestampBelow = limitOrderProtocolFacade.timestampBelow(
            timestamp
        ); // valid value
        const predicate = await limitOrderProtocolFacade.andPredicate([
            timestampBelow,
        ]);

        const order: LimitOrder = limitOrderBuilder.buildOrder({
            makerAssetAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
            makerAddress: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
            makerAmount: '1000000000000000000',
            takerAmount: '1000000000000000000',
            predicate,
        });

        const result = await limitOrderProtocolFacade.checkPredicate(order);

        expect(result).toBe(true);
    });

    it('checkPredicate() when order predicates are NOT valid then return false', async () => {
        const timestampBelow = limitOrderProtocolFacade.getContractCallData(
            LimitOrderProtocolMethods.timestampBelow,
            [12000000] // must be 0x0000...
        );
        const predicate = await limitOrderProtocolFacade.andPredicate([
            timestampBelow,
        ]);

        const order: LimitOrder = limitOrderBuilder.buildOrder({
            makerAssetAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
            makerAddress: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
            makerAmount: '1000000000000000000',
            takerAmount: '1000000000000000000',
            predicate,
        });

        const result = await limitOrderProtocolFacade.checkPredicate(order);

        expect(result).toBe(false);
    });
});
