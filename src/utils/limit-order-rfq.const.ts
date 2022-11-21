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
            {title: 'Gnosis Chain', value: ChainId.gnosisMainnet},
            {title: 'Avalanche', value: ChainId.avalancheMainnet},
            {title: 'Fantom', value: ChainId.fantomMainnet},
            {title: 'Aurora', value: ChainId.auroraMainnet},
            {title: 'Klaytn', value: ChainId.klaytnMainnet},
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
        name: 'makingAmount',
        message: 'Making asset amount',
    },
    {
        type: 'text',
        name: 'takingAmount',
        message: 'Taking asset amount',
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
        name: 'makingAmount',
        message:
            'Making asset fill amount (set 0 if you will use taking asset amount)',
    },
    {
        type: 'text',
        name: 'takingAmount',
        message: 'Taking asset amount (set 0 if has set making asset amount)',
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
    [ChainId.gnosisMainnet]: 'https://gnosis-nodes.1inch.io',
    [ChainId.avalancheMainnet]: 'https://avalanche-nodes.1inch.io',
    [ChainId.fantomMainnet]: 'https://fantom-nodes.1inch.io',
    [ChainId.auroraMainnet]: 'https://aurora-nodes.1inch.io',
    [ChainId.klaytnMainnet]: 'https://klaytn-nodes.1inch.io',
};

export const explorersUrls: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: 'https://etherscan.io',
    [ChainId.binanceMainnet]: 'https://bscscan.com',
    [ChainId.polygonMainnet]: 'https://polygonscan.com',
    [ChainId.optimismMainnet]: 'https://optimistic.etherscan.io',
    [ChainId.arbitrumMainnet]: 'https://arbiscan.io',
    [ChainId.gnosisMainnet]: 'https://gnosisscan.io',
    [ChainId.avalancheMainnet]: 'https://snowtrace.io',
    [ChainId.fantomMainnet]: 'https://ftmscan.com',
    [ChainId.auroraMainnet]: 'https://aurorascan.dev',
    [ChainId.klaytnMainnet]: 'https://scope.klaytn.com',
};
