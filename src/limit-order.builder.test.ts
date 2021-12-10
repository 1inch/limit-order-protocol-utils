import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrder, RFQOrder} from './model/limit-order-protocol.model';
import Web3 from 'web3';
import {PrivateKeyProviderConnector} from './connector/private-key-provider.connector';
import {contractAddresses} from './utils/limit-order-rfq.const';

describe('LimitOrderBuilder - for build new limit order', () => {
    const chainId = 56;
    const contractAddress = contractAddresses[chainId];

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
            const dataHash =
                '95df8d0fce8b2ce47b508d19a3d2c9df9678f2f4b0c6d9c1563d37476bc78dcd';

            const order: LimitOrder = {
                salt: '1',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                maker: 'maker',
                receiver: 'receiver',
                allowedSender: 'allowedSender',
                makingAmount: 'makingAmount',
                takingAmount: 'takingAmount',
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

            expect(signature).toMatchSnapshot();
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
                maker: 'maker',
                receiver: 'receiver',
                allowedSender: 'allowedSender',
                makingAmount: 'makingAmount',
                takingAmount: 'takingAmount',
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

            expect(hash).toMatchSnapshot();
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

            expect(order).toMatchSnapshot();
        });
    });

    describe('RFQ limit order', () => {
        it('buildOrderSignature() must call the provider signTypedData method', async () => {
            const walletAddress = '0x1548dAdf412Eaaf3c80bEad35CDa83a4bf7dF6ce';
            const dataHash =
                'b24d438b542e1ff36332b8c609d5b882187344306a7df17a785e6d44cd20c5f9';

            const order: RFQOrder = {
                info: '42238307623767714019752007434241',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                maker: 'maker',
                allowedSender: 'allowedSender',
                makingAmount: 'makingAmount',
                takingAmount: 'takingAmount',
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

            expect(signature).toMatchSnapshot();
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
                maker: 'maker',
                allowedSender: 'allowedSender',
                makingAmount: 'makingAmount',
                takingAmount: 'takingAmount',
            };
            const typedData = limitOrderBuilder.buildRFQOrderTypedData(order);

            const hash = limitOrderBuilder.buildLimitOrderHash(typedData);

            expect(hash).toMatchSnapshot();
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

            expect(RFQorder).toMatchSnapshot();
        });
    });
});
