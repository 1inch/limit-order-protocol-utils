import {ChainId} from "../model/limit-order-protocol.model";

export const rpcUrls: {[key in ChainId]: string} = {
    [ChainId.ethereumMainnet]: 'https://web3-node.1inch.io',
    [ChainId.binanceMainnet]: 'https://bsc-dataseed.binance.org',
    [ChainId.polygonMainnet]: 'https://bor-nodes.1inch.io',
    [ChainId.optimismMainnet]: 'https://optimism-nodes.1inch.io',
    [ChainId.arbitrumMainnet]: 'https://arbitrum-nodes.1inch.io',
    [ChainId.gnosisMainnet]: 'https://gnosis-nodes.1inch.io',
    [ChainId.avalancheMainnet]: 'https://avalanche-nodes.1inch.io',
    [ChainId.fantomMainnet]: 'https://fantom-nodes.1inch.io',
    [ChainId.auroraMainnet]: 'https://aurora-nodes.1inch.io',
    [ChainId.klaytnMainnet]: 'https://klaytn-nodes.1inch.io',
    [ChainId.zkSyncEraMainnet]: 'https://mainnet.era.zksync.io',
    [ChainId.baseMainnet]: 'https://mainnet.base.org',
};
