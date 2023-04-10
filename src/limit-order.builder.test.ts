import {LimitOrderDecoder} from './limit-order.decoder';
import {LimitOrderBuilder} from './limit-order.builder';
import {LimitOrder, RFQOrder} from './model/limit-order-protocol.model';
import Web3 from 'web3';
import {PrivateKeyProviderConnector} from './connector/private-key-provider.connector';
import {limitOrderProtocolAddresses} from './limit-order-protocol.const';
import {largeInteractions, largeResult} from './test/mocks';

describe('LimitOrderBuilder - for build new limit order', () => {
    const chainId = 56;
    const contractAddress = limitOrderProtocolAddresses[chainId];

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
                '7cb7e268d5a5f0d8da9a5904a0084b3c4f17a7826413e83d69784a50d4154878';

            const { interactions, offsets } = LimitOrderBuilder.packInteractions({
                makerAssetData: '0xf0',
                takerAssetData: '0xf1',
                getMakingAmount: '0xf2',
                getTakingAmount: '0xf3',
                predicate: '0xf4',
                permit: '0xf5',
                preInteraction: '0xf6',
                postInteraction: '0xf7',
            });

            const order: LimitOrder = {
                salt: '1',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                maker: 'maker',
                receiver: 'receiver',
                allowedSender: 'allowedSender',
                makingAmount: 'makingAmount',
                takingAmount: 'takingAmount',

                offsets,
                interactions,
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
                dataHash,
            );
        });

        it('buildLimitOrderHash() must create a hash of order with 0x prefix', () => {
            const { interactions, offsets } = LimitOrderBuilder.packInteractions({
                makerAssetData: '0xf0',
                takerAssetData: '0xf1',
                getMakingAmount: '0xf2',
                getTakingAmount: '0xf3',
                predicate: '0xf4',
                permit: '0xf5',
                preInteraction: '0xf6',
                postInteraction: '0xf7',
            });

            const order: LimitOrder = {
                salt: '1',
                makerAsset: 'makerAsset',
                takerAsset: 'takerAsset',
                maker: 'maker',
                receiver: 'receiver',
                allowedSender: 'allowedSender',
                makingAmount: 'makingAmount',
                takingAmount: 'takingAmount',

                offsets,
                interactions,
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
                makingAmount: '3',
                takingAmount: '100',
                predicate: '0x11',
                permit: '0x22',
                postInteraction: '0x33',
            });

            expect(
                LimitOrderDecoder.unpackInteractions(order.offsets, order.interactions)
            ).toMatchSnapshot();

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
                makingAmount: '5',
                takingAmount: '600',
            });

            expect(RFQorder).toMatchSnapshot();
        });
    });

    describe("packInteractions", () => {
            it("should pack", () => {
                const { offsets, interactions } = LimitOrderBuilder.packInteractions(largeInteractions);

                expect(offsets).toBe(largeResult.offsets);
                expect(interactions).toBe(largeResult.interactions);
            })
    })
});
