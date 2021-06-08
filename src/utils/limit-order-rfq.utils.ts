#!/usr/bin/env node

import prompts from 'prompts';
import yargs from 'yargs';
import kleur from 'kleur';
import Web3 from 'web3';
import {FakeProviderConnector} from '../../test/fake-provider.connector';
import {LimitOrderBuilder} from '../limit-order.builder';
import {LimitOrderRFQ} from '../model/limit-order-protocol.model';
import {LimitOrderProtocolFacade} from '../limit-order-protocol.facade';
import {
    cancelOrderSchema,
    contractAddresses,
    createOrderSchema,
    explorersUrls,
    fillOrderSchema,
    operationSchema,
    rpcUrls,
} from './limit-order-rfq.const';
import {
    CancelingParams,
    CreatingParams,
    FillingParams,
    OperationParams,
} from './limit-order-rfq.model';
import {TransactionConfig} from 'web3-core';

(async () => {
    prompts.override(yargs.argv);

    const operationResult = (await prompts(operationSchema)) as OperationParams;

    switch (operationResult.operation) {
        case 'create':
            await createOrderOperation();
            break;
        case 'fill':
            await fillOrderOperation();
            break;
        case 'cancel':
            await cancelOrderOperation();
            break;
        default:
            console.log('Unknown operation: ', operationResult.operation);
            break;
    }
})();

async function createOrderOperation() {
    const creatingParams = (await prompts(createOrderSchema)) as CreatingParams;

    const newOrder = createOrder(creatingParams);

    console.log(kleur.green().bold('New limit order RFQ: '));
    console.log(kleur.white().underline(JSON.stringify(newOrder, null, 4)));
}

async function fillOrderOperation() {
    const fillingParams = (await prompts(fillOrderSchema)) as FillingParams;
    const orderForFill: LimitOrderRFQ = JSON.parse(fillingParams.order);

    console.log(kleur.green().bold('Order for filling: '));
    console.log(kleur.white().underline(JSON.stringify(orderForFill, null, 4)));

    const callDataForFill = await fillOrder(fillingParams, orderForFill);

    console.log(kleur.green().bold('Order filling transaction: '));
    printTransactionLink(
        explorerTxLink(fillingParams.chainId, callDataForFill)
    );
}

async function cancelOrderOperation() {
    const cancelingParams = (await prompts(
        cancelOrderSchema
    )) as CancelingParams;

    const cancelingTxHash = await cancelOrder(cancelingParams);

    console.log(kleur.green().bold('Order canceling transaction: '));
    printTransactionLink(
        explorerTxLink(cancelingParams.chainId, cancelingTxHash)
    );
}

/* eslint-disable max-lines-per-function */
function createOrder(params: CreatingParams): LimitOrderRFQ {
    const contractAddress = contractAddresses[params.chainId];
    const web3 = new Web3(rpcUrls[params.chainId]);
    const providerConnector = new FakeProviderConnector(
        params.privateKey,
        web3
    );
    const walletAddress = web3.eth.accounts.privateKeyToAccount(
        params.privateKey
    ).address;

    const limitOrderBuilder = new LimitOrderBuilder(
        contractAddress,
        params.chainId,
        providerConnector
    );

    return limitOrderBuilder.buildOrderRFQ({
        id: params.orderId,
        expiresInTimestamp: Math.ceil(Date.now() / 1000) + params.expiresIn,
        makerAddress: walletAddress,
        makerAssetAddress: params.makerAssetAddress,
        takerAssetAddress: params.takerAssetAddress,
        makerAmount: params.makerAmount,
        takerAmount: params.takerAmount,
        takerAddress: params.takerAddress || undefined,
    });
}
/* eslint-enable max-lines-per-function */

/* eslint-disable max-lines-per-function */
async function fillOrder(
    params: FillingParams,
    order: LimitOrderRFQ
): Promise<string> {
    const contractAddress = contractAddresses[params.chainId];
    const web3 = new Web3(rpcUrls[params.chainId]);
    const providerConnector = new FakeProviderConnector(
        params.privateKey,
        web3
    );
    const walletAddress = web3.eth.accounts.privateKeyToAccount(
        params.privateKey
    ).address;

    const limitOrderBuilder = new LimitOrderBuilder(
        contractAddress,
        params.chainId,
        providerConnector
    );
    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
        contractAddress,
        providerConnector
    );

    const typedData = limitOrderBuilder.buildOrderRFQTypedData(order);
    const signature = await limitOrderBuilder.buildOrderSignature(
        walletAddress,
        typedData
    );

    const callData = limitOrderProtocolFacade.fillOrderRFQ(
        order,
        signature,
        params.makerAmount,
        params.takerAmount
    );

    const txConfig: TransactionConfig = {
        to: contractAddress,
        from: walletAddress,
        data: callData,
        value: '0',
        gas: 120_000,
        gasPrice: gweiToWei(params.gasPrice),
        nonce: await web3.eth.getTransactionCount(walletAddress),
    };

    return sendSignedTransaction(web3, txConfig, params.privateKey);
}
/* eslint-enable max-lines-per-function */

/* eslint-disable max-lines-per-function */
async function cancelOrder(params: CancelingParams): Promise<string> {
    const contractAddress = contractAddresses[params.chainId];
    const web3 = new Web3(
        new Web3.providers.HttpProvider(rpcUrls[params.chainId])
    );
    const providerConnector = new FakeProviderConnector(
        params.privateKey,
        web3
    );
    const walletAddress = web3.eth.accounts.privateKeyToAccount(
        params.privateKey
    ).address;

    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
        contractAddress,
        providerConnector
    );

    const callData = limitOrderProtocolFacade.cancelOrderRFQ(params.orderInfo);
    const txConfig: TransactionConfig = {
        to: contractAddress,
        from: walletAddress,
        data: callData,
        value: '0',
        gas: 50_000,
        gasPrice: gweiToWei(params.gasPrice),
        nonce: await web3.eth.getTransactionCount(walletAddress),
    };

    return sendSignedTransaction(web3, txConfig, params.privateKey);
}
/* eslint-enable max-lines-per-function */

async function sendSignedTransaction(
    web3: Web3,
    txConfig: TransactionConfig,
    privateKey: string
): Promise<string> {
    const sign = await web3.eth.accounts.signTransaction(txConfig, privateKey);

    return await new Promise<string>((resolve, reject) => {
        web3.eth.sendSignedTransaction(
            sign.rawTransaction as string,
            (error, hash) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(hash);
            }
        );
    });
}

function explorerTxLink(chainId: number, txHash: string): string {
    const explorerUrl = explorersUrls[chainId];

    return `${explorerUrl}/tx/${txHash}`;
}

function gweiToWei(value: number): string {
    return value + '000000000';
}

function printTransactionLink(text: string): void {
    console.log(
        kleur.white('************************************************')
    );
    console.log(kleur.white('   '));
    console.log(kleur.white().underline(text));
    console.log(kleur.white('   '));
    console.log(
        kleur.white('************************************************')
    );
}
