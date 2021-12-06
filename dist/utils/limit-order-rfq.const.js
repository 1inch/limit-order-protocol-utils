"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explorersUrls = exports.contractAddresses = exports.rpcUrls = exports.cancelOrderSchema = exports.fillOrderSchema = exports.createOrderSchema = exports.operationSchema = void 0;
const limit_order_protocol_model_1 = require("../model/limit-order-protocol.model");
const commonProperties = [
    {
        type: 'select',
        name: 'chainId',
        message: 'Select network',
        choices: [
            { title: 'Ethereum', value: limit_order_protocol_model_1.ChainId.etherumMainnet },
            { title: 'BSC', value: limit_order_protocol_model_1.ChainId.binanceMainnet },
            { title: 'Polygon', value: limit_order_protocol_model_1.ChainId.polygonMainnet },
            { title: 'Optimism', value: limit_order_protocol_model_1.ChainId.optimismMainnet },
            { title: 'Arbitrum', value: limit_order_protocol_model_1.ChainId.arbitrumMainnet },
        ],
    },
    {
        type: 'password',
        name: 'privateKey',
        message: 'Enter your private key',
    },
];
exports.operationSchema = [
    {
        type: 'select',
        name: 'operation',
        choices: [
            { title: 'create', value: 'create' },
            { title: 'fill', value: 'fill' },
            { title: 'cancel', value: 'cancel' },
        ],
        message: 'Choose operation for limit order RFQ: create, fill, cancel',
    },
];
exports.createOrderSchema = [
    ...commonProperties,
    {
        type: 'number',
        name: 'orderId',
        message: 'Limit order RFQ id',
    },
    {
        type: 'number',
        name: 'expiresIn',
        message: 'Expires in (seconds, for example: 300 - order will expired in 5 mins)',
        initial: 300,
    },
    {
        type: 'text',
        name: 'makerAssetAddress',
        message: 'Maker asset address',
    },
    {
        type: 'text',
        name: 'takerAssetAddress',
        message: 'Taker asset address',
    },
    {
        type: 'text',
        name: 'makerAmount',
        message: 'Maker asset amount',
    },
    {
        type: 'text',
        name: 'takerAmount',
        message: 'Taker asset amount',
    },
    {
        type: 'text',
        name: 'takerAddress',
        message: 'Taker address (optional)',
    },
];
exports.fillOrderSchema = [
    ...commonProperties,
    {
        type: 'number',
        name: 'gasPrice',
        message: 'Gas price (GWEI)',
        initial: 10,
    },
    {
        type: 'text',
        name: 'order',
        message: 'Limit order RFQ json',
    },
    {
        type: 'text',
        name: 'makerAmount',
        message: 'Maker asset fill amount (set 0 if you will use taker asset amount)',
    },
    {
        type: 'text',
        name: 'takerAmount',
        message: 'Taker asset amount (set 0 if has set maker asset amount)',
    },
];
exports.cancelOrderSchema = [
    ...commonProperties,
    {
        type: 'number',
        name: 'gasPrice',
        message: 'Gas price (GWEI)',
        initial: 10,
    },
    {
        type: 'text',
        name: 'orderInfo',
        message: 'Order info',
    },
];
exports.rpcUrls = {
    [limit_order_protocol_model_1.ChainId.etherumMainnet]: 'https://web3-node.1inch.io',
    [limit_order_protocol_model_1.ChainId.binanceMainnet]: 'https://bsc-dataseed.binance.org',
    [limit_order_protocol_model_1.ChainId.polygonMainnet]: 'https://bor-nodes.1inch.io',
    [limit_order_protocol_model_1.ChainId.optimismMainnet]: 'https://optimism-nodes.1inch.io',
    [limit_order_protocol_model_1.ChainId.arbitrumMainnet]: 'https://arbitrum-nodes.1inch.io',
};
exports.contractAddresses = {
    [limit_order_protocol_model_1.ChainId.etherumMainnet]: '0x119c71d3bbac22029622cbaec24854d3d32d2828',
    [limit_order_protocol_model_1.ChainId.binanceMainnet]: '0x1e38eff998df9d3669e32f4ff400031385bf6362',
    [limit_order_protocol_model_1.ChainId.polygonMainnet]: '0x94bc2a1c732bcad7343b25af48385fe76e08734f',
    [limit_order_protocol_model_1.ChainId.optimismMainnet]: '0x11431a89893025d2a48dca4eddc396f8c8117187',
    [limit_order_protocol_model_1.ChainId.arbitrumMainnet]: '0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9',
};
exports.explorersUrls = {
    [limit_order_protocol_model_1.ChainId.etherumMainnet]: 'https://etherscan.io',
    [limit_order_protocol_model_1.ChainId.binanceMainnet]: 'https://bscscan.com',
    [limit_order_protocol_model_1.ChainId.polygonMainnet]: 'https://polygonscan.com',
    [limit_order_protocol_model_1.ChainId.optimismMainnet]: 'https://optimistic.etherscan.io',
    [limit_order_protocol_model_1.ChainId.arbitrumMainnet]: 'https://arbiscan.io',
};
//# sourceMappingURL=limit-order-rfq.const.js.map