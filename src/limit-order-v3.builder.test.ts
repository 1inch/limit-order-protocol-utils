import {LimitOrderDecoder} from './limit-order.decoder';
import {LimitOrderLegacy} from './model/limit-order-protocol.model';
import Web3 from 'web3';
import {PrivateKeyProviderConnector} from './connector/private-key-provider.connector';
import {limitOrderProtocolAddresses} from './limit-order-protocol.const';
import {largeInteractions, largeResult} from './test/mocks';
import {LimitOrderV3Builder} from "./limit-order-v3.builder";

describe('LimitOrderV3Builder - for build new limit order', () => {
    const chainId = 56;
    const contractAddress = limitOrderProtocolAddresses[chainId];

    const web3 = new Web3('https://bsc-dataseed.binance.org');
    const privateKey =
        '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc';
    const providerConnector = new PrivateKeyProviderConnector(privateKey, web3);

    let limitOrderBuilder: LimitOrderV3Builder;

    beforeEach(() => {
        limitOrderBuilder = new LimitOrderV3Builder(
            providerConnector,
            {
                domainName: '1inch Aggregation Router',
                version: '5'
            }
        );
    });

    describe('Normal limit order', () => {
        it('buildOrderSignature() must call the provider signTypedData method', async () => {
            const walletAddress = '0x1548dAdf412Eaaf3c80bEad35CDa83a4bf7dF6ce';
            const dataHash =
                '7cb7e268d5a5f0d8da9a5904a0084b3c4f17a7826413e83d69784a50d4154878';

            const { interactions, offsets } = LimitOrderV3Builder.packInteractions({
                makerAssetData: '0xf0',
                takerAssetData: '0xf1',
                getMakingAmount: '0xf2',
                getTakingAmount: '0xf3',
                predicate: '0xf4',
                permit: '0xf5',
                preInteraction: '0xf6',
                postInteraction: '0xf7',
            });

            const order: LimitOrderLegacy = {
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
            const typedData = limitOrderBuilder.buildLimitOrderTypedData(
                order,
                chainId,
                contractAddress
            );

            const signTypedDataSpy = jest.spyOn(
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
            const { interactions, offsets } = LimitOrderV3Builder.packInteractions({
                makerAssetData: '0xf0',
                takerAssetData: '0xf1',
                getMakingAmount: '0xf2',
                getTakingAmount: '0xf3',
                predicate: '0xf4',
                permit: '0xf5',
                preInteraction: '0xf6',
                postInteraction: '0xf7',
            });

            const order: LimitOrderLegacy = {
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
            const typedData = limitOrderBuilder.buildLimitOrderTypedData(
                order,
                chainId,
                contractAddress
            );

            const hash = limitOrderBuilder.buildLimitOrderHash(typedData);

            expect(hash).toMatchSnapshot();
        });

        it('buildLimitOrder() must create a limit order instance according to the given parameters', async () => {
            const makerAddress = '0xdddd91605c18a9999c1d47abfeed5daaaa700000';

            const order = limitOrderBuilder.buildLimitOrder({
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
                LimitOrderDecoder.unpackInteractionsV3(order.offsets, order.interactions)
            ).toMatchSnapshot();

            expect(+order.salt).toBeGreaterThan(1);

            order.salt = '1';

            expect(order).toMatchSnapshot();
        });
    });

    describe("packInteractions", () => {
            it("should pack", () => {
                const { offsets, interactions } = LimitOrderV3Builder.packInteractions(largeInteractions);

                expect(offsets).toBe(largeResult.offsets);
                expect(interactions).toBe(largeResult.interactions);
            })
    })
});
