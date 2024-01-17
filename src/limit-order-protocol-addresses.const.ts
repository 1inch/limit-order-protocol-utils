import {ChainId} from "./model/limit-order-protocol.model";

export const limitOrderProtocolAddresses: { [key in ChainId]: string } = {
    [ChainId.ethereumMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.binanceMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.polygonMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.optimismMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.arbitrumMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.auroraMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.gnosisMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.avalancheMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.fantomMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.klaytnMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.zkSyncEraMainnet]: '0x6e2b76966cbd9cf4cc2fa0d76d24d5241e0abc2f',
    [ChainId.baseMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
} as const;
