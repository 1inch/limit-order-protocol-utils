import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrder, RFQOrder} from './model/limit-order-protocol.model';
import Web3 from 'web3';
import {RFQ_ORDER_SNAPSHOT, ORDER_SNAPSHOT} from '../test/order-snapshot';
import {PrivateKeyProviderConnector} from './connector/private-key-provider.connector';

describe('LimitOrderBuilder - for build new limit order', () => {
    const contractAddress = '0x4523f4a1ca37736837b423d63ea78fc13862eaf8';
    const chainId = 56;

    const web3 = new Web3('https://bsc-dataseed.binance.org');
    const privateKey =
        '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc';
    const providerConnector = new PrivateKeyProviderConnector(privateKey, web3);

    let limitOrderBuilder: LimitOrderBuilder;

    beforeEach(() => {
        limitOrderBuilder = new LimitOrderBuilder(
            contractAddress,
            chainId,
            providerConnector
        );
    });

    describe('Normal limit order', () => {
        it('buildOrderSignature() must call the provider signTypedData method', async () => {
            const walletAddress = '0x1548dAdf412Eaaf3c80bEad35CDa83a4bf7dF6ce';
            const expectedSignature =
                '0x80e5d516efcee3ffba3c0ad3e90091b749fc2930862399bfcd' +
                '9ef7cd5c8f07e87505691727d4d17faba35f739bf2f2f8a606ac3ba640b3b2a0809953a1f9aaa81c';
            const dataHash =
                'c2664ebe815297a7ec0dce88b9879bd5b0ca47345a188a80f1a2eef1b59deb26';

            const order: LimitOrder = {
                salt: '1',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                makerAssetData: 'makerAssetData',
                takerAssetData: 'takerAssetData',
                getMakerAmount: 'getMakerAmount',
                getTakerAmount: 'getTakerAmount',
                predicate: 'predicate',
                permit: 'permit',
                interaction: 'interaction',
            };
            const typedData = limitOrderBuilder.buildLimitOrderTypedData(order);

            const signTypedDataSpy = spyOn(
                providerConnector,
                'signTypedData'
            ).and.callThrough();

            const signature = await limitOrderBuilder.buildOrderSignature(
                walletAddress,
                typedData
            );

            expect(signature).toBe(expectedSignature);
            expect(signTypedDataSpy).toHaveBeenCalledTimes(1);
            expect(signTypedDataSpy).toHaveBeenCalledWith(
                walletAddress,
                typedData,
                dataHash
            );
        });

        it('buildLimitOrderHash() must create a hash of order with 0x prefix', () => {
            const order: LimitOrder = {
                salt: '1',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                makerAssetData: 'makerAssetData',
                takerAssetData: 'takerAssetData',
                getMakerAmount: 'getMakerAmount',
                getTakerAmount: 'getTakerAmount',
                predicate: 'predicate',
                permit: 'permit',
                interaction: 'interaction',
            };
            const typedData = limitOrderBuilder.buildLimitOrderTypedData(order);

            const hash = limitOrderBuilder.buildLimitOrderHash(typedData);

            expect(hash).toBe(
                '0xff7b0a08dd824a005baaae0034eb69fff0679a2f765110f240f9ecdd86484375'
            );
        });

        it('buildLimitOrder() must create a limit order instance according to the given parameters', async () => {
            const makerAddress = '0xdddd91605c18a9999c1d47abfeed5daaaa700000';

            const order = await limitOrderBuilder.buildLimitOrder({
                makerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
                makerAddress,
                makerAmount: '3',
                takerAmount: '100',
                predicate: '0x111',
                permit: '0x222',
                interaction: '0x333',
            });

            expect(+order.salt).toBeGreaterThan(1);

            order.salt = '1';

            expect(order).toEqual(ORDER_SNAPSHOT);
        });
    });

    describe('RFQ limit order', () => {
        it('buildOrderSignature() must call the provider signTypedData method', async () => {
            const walletAddress = '0x1548dAdf412Eaaf3c80bEad35CDa83a4bf7dF6ce';
            const expectedSignature =
                '0xeeab164a9b5cb781027ede9df911a10ff658e6147157d65d1676f54590' +
                'd17ed2752bd386e2b665c15ab5627f0279fd0218d30112512894813821354eccf09e181b';
            const dataHash =
                'e443e4a726c281bda2bd124d8e1d0f9b0c5381e09849f70e2cf1157fec89a9cd';

            const order: RFQOrder = {
                info: '42238307623767714019752007434241',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                makerAssetData: 'makerAssetData',
                takerAssetData: 'takerAssetData',
            };
            const typedData = limitOrderBuilder.buildRFQOrderTypedData(order);

            const signTypedDataSpy = spyOn(
                providerConnector,
                'signTypedData'
            ).and.callThrough();

            const signature = await limitOrderBuilder.buildOrderSignature(
                walletAddress,
                typedData
            );

            expect(signature).toBe(expectedSignature);
            expect(signTypedDataSpy).toHaveBeenCalledTimes(1);
            expect(signTypedDataSpy).toHaveBeenCalledWith(
                walletAddress,
                typedData,
                dataHash
            );
        });

        it('buildLimitOrderHash() must create a hash of order with 0x prefix', () => {
            const order: RFQOrder = {
                info: '42238307623767714019752007434241',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                makerAssetData: 'makerAssetData',
                takerAssetData: 'takerAssetData',
            };
            const typedData = limitOrderBuilder.buildRFQOrderTypedData(order);

            const hash = limitOrderBuilder.buildLimitOrderHash(typedData);

            expect(hash).toBe(
                '0x298379087a16c7ed8c536f5aadeff5385509da6082d2fef0f9a338d1af207aa3'
            );
        });

        it('buildLimitOrder() must create an RFQ limit order instance according to the given parameters', async () => {
            const makerAddress = '0xdddd91605c18a9999c1d47abfeed5daaaa800000';

            const RFQorder = await limitOrderBuilder.buildRFQOrder({
                id: 1,
                expiresInTimestamp: 1623166102,
                makerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
                takerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                makerAddress,
                makerAmount: '5',
                takerAmount: '600',
            });

            expect(RFQorder).toEqual(RFQ_ORDER_SNAPSHOT);
        });
    });
});
