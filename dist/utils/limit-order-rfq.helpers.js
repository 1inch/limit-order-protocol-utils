#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gweiToWei = exports.sendSignedTransaction = exports.cancelOrder = exports.fillOrder = exports.createOrder = exports.cancelOrderOperation = exports.fillOrderOperation = exports.createOrderOperation = void 0;
const tslib_1 = require("tslib");
const prompts_1 = tslib_1.__importDefault(require("prompts"));
const kleur_1 = tslib_1.__importDefault(require("kleur"));
const web3_1 = tslib_1.__importDefault(require("web3"));
const limit_order_builder_1 = require("../limit-order.builder");
const limit_order_protocol_facade_1 = require("../limit-order-protocol.facade");
const limit_order_rfq_const_1 = require("./limit-order-rfq.const");
const private_key_provider_connector_1 = require("../connector/private-key-provider.connector");
function createOrderOperation(isRunningWithArgv, params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const creatingParams = params || (yield prompts_1.default(limit_order_rfq_const_1.createOrderSchema));
        const newOrder = createOrder(creatingParams);
        if (isRunningWithArgv) {
            console.log(JSON.stringify(newOrder));
            return;
        }
        console.log(kleur_1.default.green().bold('New limit order RFQ: '));
        console.log(kleur_1.default.white().underline(JSON.stringify(newOrder, null, 4)));
    });
}
exports.createOrderOperation = createOrderOperation;
function fillOrderOperation(isRunningWithArgv, params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fillingParams = params || (yield prompts_1.default(limit_order_rfq_const_1.fillOrderSchema));
        const orderForFill = JSON.parse(fillingParams.order);
        console.log(kleur_1.default.green().bold('Order for filling: '));
        console.log(kleur_1.default.white().underline(JSON.stringify(orderForFill, null, 4)));
        const txHash = yield fillOrder(fillingParams, orderForFill);
        if (isRunningWithArgv) {
            console.log(txHash);
            return;
        }
        console.log(kleur_1.default.green().bold('Order filling transaction: '));
        printTransactionLink(explorerTxLink(fillingParams.chainId, txHash));
    });
}
exports.fillOrderOperation = fillOrderOperation;
function cancelOrderOperation(isRunningWithArgv, params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cancelingParams = params || (yield prompts_1.default(limit_order_rfq_const_1.cancelOrderSchema));
        const cancelingTxHash = yield cancelOrder(cancelingParams);
        if (isRunningWithArgv) {
            console.log(cancelingTxHash);
            return;
        }
        console.log(kleur_1.default.green().bold('Order canceling transaction: '));
        printTransactionLink(explorerTxLink(cancelingParams.chainId, cancelingTxHash));
    });
}
exports.cancelOrderOperation = cancelOrderOperation;
/* eslint-disable max-lines-per-function */
function createOrder(params) {
    const contractAddress = limit_order_rfq_const_1.contractAddresses[params.chainId];
    const web3 = new web3_1.default(limit_order_rfq_const_1.rpcUrls[params.chainId]);
    const providerConnector = new private_key_provider_connector_1.PrivateKeyProviderConnector(params.privateKey, web3);
    const walletAddress = web3.eth.accounts.privateKeyToAccount(params.privateKey).address;
    const limitOrderBuilder = new limit_order_builder_1.LimitOrderBuilder(contractAddress, params.chainId, providerConnector);
    return limitOrderBuilder.buildRFQOrder({
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
exports.createOrder = createOrder;
/* eslint-enable max-lines-per-function */
/* eslint-disable max-lines-per-function */
function fillOrder(params, order) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const contractAddress = limit_order_rfq_const_1.contractAddresses[params.chainId];
        const web3 = new web3_1.default(limit_order_rfq_const_1.rpcUrls[params.chainId]);
        const providerConnector = new private_key_provider_connector_1.PrivateKeyProviderConnector(params.privateKey, web3);
        const walletAddress = web3.eth.accounts.privateKeyToAccount(params.privateKey).address;
        const limitOrderBuilder = new limit_order_builder_1.LimitOrderBuilder(contractAddress, params.chainId, providerConnector);
        const limitOrderProtocolFacade = new limit_order_protocol_facade_1.LimitOrderProtocolFacade(contractAddress, providerConnector);
        const typedData = limitOrderBuilder.buildRFQOrderTypedData(order, params.domainName || undefined);
        const signature = yield limitOrderBuilder.buildOrderSignature(walletAddress, typedData);
        const callData = limitOrderProtocolFacade.fillRFQOrder(order, signature, params.makerAmount, params.takerAmount);
        const txConfig = {
            to: contractAddress,
            from: walletAddress,
            data: callData,
            value: '0',
            gas: 120000,
            gasPrice: gweiToWei(params.gasPrice),
            nonce: yield web3.eth.getTransactionCount(walletAddress),
        };
        return sendSignedTransaction(web3, txConfig, params.privateKey);
    });
}
exports.fillOrder = fillOrder;
/* eslint-enable max-lines-per-function */
/* eslint-disable max-lines-per-function */
function cancelOrder(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const contractAddress = limit_order_rfq_const_1.contractAddresses[params.chainId];
        const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(limit_order_rfq_const_1.rpcUrls[params.chainId]));
        const providerConnector = new private_key_provider_connector_1.PrivateKeyProviderConnector(params.privateKey, web3);
        const walletAddress = web3.eth.accounts.privateKeyToAccount(params.privateKey).address;
        const limitOrderProtocolFacade = new limit_order_protocol_facade_1.LimitOrderProtocolFacade(contractAddress, providerConnector);
        const callData = limitOrderProtocolFacade.cancelRFQOrder(params.orderInfo);
        const txConfig = {
            to: contractAddress,
            from: walletAddress,
            data: callData,
            value: '0',
            gas: 50000,
            gasPrice: gweiToWei(params.gasPrice),
            nonce: yield web3.eth.getTransactionCount(walletAddress),
        };
        return sendSignedTransaction(web3, txConfig, params.privateKey);
    });
}
exports.cancelOrder = cancelOrder;
/* eslint-enable max-lines-per-function */
function sendSignedTransaction(web3, txConfig, privateKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const sign = yield web3.eth.accounts.signTransaction(txConfig, privateKey);
        return yield new Promise((resolve, reject) => {
            web3.eth.sendSignedTransaction(sign.rawTransaction, (error, hash) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(hash);
            });
        });
    });
}
exports.sendSignedTransaction = sendSignedTransaction;
function explorerTxLink(chainId, txHash) {
    const explorerUrl = limit_order_rfq_const_1.explorersUrls[chainId];
    return `${explorerUrl}/tx/${txHash}`;
}
function gweiToWei(value) {
    return value + '000000000';
}
exports.gweiToWei = gweiToWei;
function printTransactionLink(text) {
    console.log(kleur_1.default.white('************************************************'));
    console.log(kleur_1.default.white('   '));
    console.log(kleur_1.default.white().underline(text));
    console.log(kleur_1.default.white('   '));
    console.log(kleur_1.default.white('************************************************'));
}
//# sourceMappingURL=limit-order-rfq.helpers.js.map