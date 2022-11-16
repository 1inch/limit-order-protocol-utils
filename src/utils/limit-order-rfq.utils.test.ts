import {
    createOrder,
    fillOrder,
    gweiToWei,
    sendSignedTransaction,
} from './limit-order-rfq.helpers';
import {contractAddresses, rpcUrls} from './limit-order-rfq.const';
import Web3 from 'web3';
import {PrivateKeyProviderConnector} from '../connector/private-key-provider.connector';
import {LimitOrderBuilder} from '../limit-order.builder';
import {LimitOrderProtocolFacade} from '../limit-order-protocol.facade';
import {TransactionConfig} from 'web3-core';

describe.skip('Limit order rfq utils', () => {
    const chainId = 56;
    const privateKey = 'SET YOUR PRIVATE KEY';

    it('Fill RFQ order', async () => {
        const order = createOrder({
            privateKey,
            chainId,
            orderId: 1,
            expiresIn: Math.ceil((Date.now() + 20_000) / 1000),
            makerAssetAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302', // 1inch
            makingAmount: '100000000000000000',
            takingAmount: '23000000000000000',
        });

        const txHash = await fillOrder(
            {
                privateKey,
                chainId,
                gasPrice: 15, // GWEI
                order: JSON.stringify(order),
                makingAmount: order.makingAmount,
                takingAmount: '0',
            },
            order
        );

        expect(txHash).toBe('tx hash');
    });

    it('Fill limit order', async () => {
        const contractAddress = contractAddresses[chainId];
        const web3 = new Web3(rpcUrls[chainId]);
        const providerConnector = new PrivateKeyProviderConnector(
            privateKey,
            web3
        );
        const walletAddress = web3.eth.accounts
            .privateKeyToAccount(privateKey)
            .address.toLowerCase();

        const limitOrderBuilder = new LimitOrderBuilder(
            contractAddress,
            chainId,
            providerConnector
        );

        const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
            contractAddress,
            chainId,
            providerConnector,
        );

        const order = limitOrderBuilder.buildLimitOrder({
            makerAddress: walletAddress,
            makerAssetAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302', // 1inch
            makingAmount: '100000000000000000',
            takingAmount: '23000000000000000',
        });

        const typedData = limitOrderBuilder.buildLimitOrderTypedData(order);
        const signature = await limitOrderBuilder.buildOrderSignature(
            walletAddress,
            typedData
        );

        const callData = limitOrderProtocolFacade.fillLimitOrder({
            order,
            signature,
            makingAmount: order.makingAmount,
            takingAmount: '0',
            thresholdAmount: '100000000000000001',
        });

        const txConfig: TransactionConfig = {
            to: contractAddress,
            from: walletAddress,
            data: callData,
            value: '0',
            gas: 120_000,
            gasPrice: gweiToWei(15),
            nonce: await web3.eth.getTransactionCount(walletAddress),
        };

        const txHash = await sendSignedTransaction(web3, txConfig, privateKey);

        expect(txHash).toBe('tx hash');
    });
});
