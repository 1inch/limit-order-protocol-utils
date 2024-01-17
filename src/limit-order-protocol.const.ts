import {AbiItem} from './model/abi.model';
import LimitOrderProtocolABISource from './abi/LimitOrderProtocol.json';
import LimitOrderProtocolV3ABISource from './abi/LimitOrderProtocolV3.json';
import ERC20ABISource from './abi/ERC20ABI.json';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { ChainId } from './model/limit-order-protocol.model';

export const PROTOCOL_NAME = '1inch Aggregation Router';

export const PROTOCOL_VERSION = '6';

export const TypedDataVersion = SignTypedDataVersion.V4;

export const ZX = '0x';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const CALL_RESULTS_PREFIX = 'CALL_RESULTS_';

export const LIMIT_ORDER_PROTOCOL_ABI: AbiItem[] = LimitOrderProtocolABISource;

export const LIMIT_ORDER_PROTOCOL_V3_ABI: AbiItem[] = LimitOrderProtocolV3ABISource;

export const ERC20_ABI: AbiItem[] = ERC20ABISource;

export const EIP712_DOMAIN = [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'},
    {name: 'verifyingContract', type: 'address'},
];

export const limitOrderProtocolAddresses: {[key in ChainId]: string} = {
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

/**
 * @deprecated Change to `limitOrderProtocolAddresses`
 */
export const contractAddresses = limitOrderProtocolAddresses;
