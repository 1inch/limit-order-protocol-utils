import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrder, LimitOrderRFQ} from './model/limit-order-protocol.model';
import Web3 from 'web3';
import {FakeProviderConnector} from '../test/fake-provider.connector';
import {ORDER_RFQ_SNAPSHOT, ORDER_SNAPSHOT} from '../test/order-snapshot';

describe('LimitOrderBuilder - for build new limit order', () => {
    const contractAddress = '0xaaaaa';
    const chainId = 56;

    const web3 = new Web3('https://bsc-dataseed.binance.org');
    const privateKey =
        '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc';
    const providerConnector = new FakeProviderConnector(privateKey, web3);

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
                '0x526dfdcecc99e2f9cc823042cd177' +
                'd22c1c86923a4c577dda58c0a7f18365a884325b07acc' +
                'd1b5cae4272fbd591418026508243c18774a468d968f1fe09341991b';
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
            const typedData = limitOrderBuilder.buildOrderTypedData(order);

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

        it('buildOrderHash() must create a hash of order with 0x prefix', () => {
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
            const typedData = limitOrderBuilder.buildOrderTypedData(order);

            const hash = limitOrderBuilder.buildOrderHash(typedData);

            expect(hash).toBe(
                '0x7c82935dfbdc224a1ca8f86c07e545b04514b107f9a8d96a34dee95635a4cc11'
            );
        });

        it('buildOrder() must create a limit order instance according to the given parameters', async () => {
            const makerAddress = '0xdddd91605c18a9999c1d47abfeed5daaaa700000';

            const order = await limitOrderBuilder.buildOrder({
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
                '0xd5299db23008a564d628debcc7af6e0809b309a6441b97b86' +
                '6ddd626fe7bab572d23a18a7e912942d0f9405d96af99' +
                '956d3500072686884d6a1b1d185be80ab61c';
            const dataHash =
                'e443e4a726c281bda2bd124d8e1d0f9b0c5381e09849f70e2cf1157fec89a9cd';

            const order: LimitOrderRFQ = {
                info: '42238307623767714019752007434241',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                makerAssetData: 'makerAssetData',
                takerAssetData: 'takerAssetData',
            };
            const typedData = limitOrderBuilder.buildOrderRFQTypedData(order);

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

        it('buildOrderHash() must create a hash of order with 0x prefix', () => {
            const order: LimitOrderRFQ = {
                info: '42238307623767714019752007434241',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                makerAssetData: 'makerAssetData',
                takerAssetData: 'takerAssetData',
            };
            const typedData = limitOrderBuilder.buildOrderRFQTypedData(order);

            const hash = limitOrderBuilder.buildOrderHash(typedData);

            expect(hash).toBe(
                '0x04aba335aed9f3a4f9d3cb06b6630c678331565509f7fd7b57f3f948033db0d0'
            );
        });

        it('buildOrder() must create a RFQ limit order instance according to the given parameters', async () => {
            const makerAddress = '0xdddd91605c18a9999c1d47abfeed5daaaa800000';

            const orderRFQ = await limitOrderBuilder.buildOrderRFQ({
                id: 1,
                expiresInTimestamp: 1623166102,
                makerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
                takerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                makerAddress,
                makerAmount: '5',
                takerAmount: '600',
            });

            expect(orderRFQ).toEqual(ORDER_RFQ_SNAPSHOT);
        });
    });
});
