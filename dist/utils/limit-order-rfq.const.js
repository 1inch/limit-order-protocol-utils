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
    [limit_order_protocol_model_1.ChainId.etherumMainnet]: '0xf667e1626a463a80e45647977d6fdc88923221a2',
    [limit_order_protocol_model_1.ChainId.binanceMainnet]: '0x1e38Eff998DF9d3669E32f4ff400031385Bf6362',
    [limit_order_protocol_model_1.ChainId.polygonMainnet]: '0x7871769b3816b23db12e83a482aac35f1fd35d4b',
    [limit_order_protocol_model_1.ChainId.optimismMainnet]: '0x57da811a9ef9b79dbc2ea6f6dc39368a8da1cf07',
    [limit_order_protocol_model_1.ChainId.arbitrumMainnet]: '0x59a0a6d73e6a5224871f45e6d845ce1574063ade',
};
exports.explorersUrls = {
    [limit_order_protocol_model_1.ChainId.etherumMainnet]: 'https://etherscan.io',
    [limit_order_protocol_model_1.ChainId.binanceMainnet]: 'https://bscscan.com',
    [limit_order_protocol_model_1.ChainId.polygonMainnet]: 'https://polygonscan.com',
    [limit_order_protocol_model_1.ChainId.optimismMainnet]: 'https://optimistic.etherscan.io',
    [limit_order_protocol_model_1.ChainId.arbitrumMainnet]: 'https://arbiscan.io',
};
//# sourceMappingURL=limit-order-rfq.const.js.map