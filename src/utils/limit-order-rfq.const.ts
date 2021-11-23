import {PromptObject} from 'prompts';
import {ChainId} from '../model/limit-order-protocol.model';

const commonProperties: PromptObject[] = [
    {
        type: 'select',
        name: 'chainId',
        message: 'Select network',
        choices: [
            {title: 'Ethereum', value: ChainId.etherumMainnet},
            {title: 'BSC', value: ChainId.binanceMainnet},
            {title: 'Polygon', value: ChainId.polygonMainnet},
            {title: 'Optimism', value: ChainId.optimismMainnet},
            {title: 'Arbitrum', value: ChainId.arbitrumMainnet},
        ],
    },
    {
        type: 'password',
        name: 'privateKey',
        message: 'Enter your private key',
    },
];

export const operationSchema: PromptObject[] = [
    {
        type: 'select',
        name: 'operation',
        choices: [
            {title: 'create', value: 'create'},
            {title: 'fill', value: 'fill'},
            {title: 'cancel', value: 'cancel'},
        ],
        message: 'Choose operation for limit order RFQ: create, fill, cancel',
    },
];

export const createOrderSchema: PromptObject[] = [
    ...commonProperties,
    {
        type: 'number',
        name: 'orderId',
        message: 'Limit order RFQ id',
    },
    {
        type: 'number',
        name: 'expiresIn',
        message:
            'Expires in (seconds, for example: 300 - order will expired in 5 mins)',
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

export const fillOrderSchema: PromptObject[] = [
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
        message:
            'Maker asset fill amount (set 0 if you will use taker asset amount)',
    },
    {
        type: 'text',
        name: 'takerAmount',
        message: 'Taker asset amount (set 0 if has set maker asset amount)',
    },
];

export const cancelOrderSchema: PromptObject[] = [
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

export const rpcUrls: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: 'https://web3-node.1inch.io',
    [ChainId.binanceMainnet]: 'https://bsc-dataseed.binance.org',
    [ChainId.polygonMainnet]: 'https://bor-nodes.1inch.io',
    [ChainId.optimismMainnet]: 'https://optimism-nodes.1inch.io',
    [ChainId.arbitrumMainnet]: 'https://arbitrum-nodes.1inch.io',
};

export const contractAddresses: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: '0x3ef51736315f52d568d6d2cf289419b9cfffe782',
    [ChainId.binanceMainnet]: '0xe3456f4ee65e745a44ec3bcb83d0f2529d1b84eb',
    [ChainId.polygonMainnet]: '0xb707d89d29c189421163515c59e42147371d6857',
    [ChainId.optimismMainnet]: '0xb707d89d29c189421163515c59e42147371d6857',
    [ChainId.arbitrumMainnet]: '0xe295ad71242373c37c5fda7b57f26f9ea1088afe',
};

export const explorersUrls: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: 'https://etherscan.io',
    [ChainId.binanceMainnet]: 'https://bscscan.com',
    [ChainId.polygonMainnet]: 'https://polygonscan.com',
    [ChainId.optimismMainnet]: 'https://optimistic.etherscan.io',
    [ChainId.arbitrumMainnet]: 'https://arbiscan.io',
};
