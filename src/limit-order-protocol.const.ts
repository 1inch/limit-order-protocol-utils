import {AbiItem} from './model/abi.model';
import LimitOrderProtocolABISource from './abi/LimitOrderProtocol.json';
import ERC20ABISource from './abi/ERC20ABI.json';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { ChainId } from './model/limit-order-protocol.model';

export const PROTOCOL_NAME = '1inch Aggregation Router';

export const PROTOCOL_VERSION = '5';

export const TypedDataVersion = SignTypedDataVersion.V4;

export const ZX = '0x';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const CALL_RESULTS_PREFIX = 'CALL_RESULTS_';

export const LIMIT_ORDER_PROTOCOL_ABI: AbiItem[] = LimitOrderProtocolABISource;

export const ERC20_ABI: AbiItem[] = ERC20ABISource;

export const EIP712_DOMAIN = [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'},
    {name: 'verifyingContract', type: 'address'},
];

export const ORDER_STRUCTURE = [
    {name: 'salt', type: 'uint256'},
    {name: 'makerAsset', type: 'address'},
    {name: 'takerAsset', type: 'address'},
    {name: 'maker', type: 'address'},
    {name: 'receiver', type: 'address'},
    {name: 'allowedSender', type: 'address'},
    {name: 'makingAmount', type: 'uint256'},
    {name: 'takingAmount', type: 'uint256'},
    { name: 'offsets', type: 'uint256' },
    { name: 'interactions', type: 'bytes' },
];

export const RFQ_ORDER_STRUCTURE = [
    {name: 'info', type: 'uint256'},
    {name: 'makerAsset', type: 'address'},
    {name: 'takerAsset', type: 'address'},
    {name: 'maker', type: 'address'},
    {name: 'allowedSender', type: 'address'},
    {name: 'makingAmount', type: 'uint256'},
    {name: 'takingAmount', type: 'uint256'},
];

export const limitOrderProtocolAddresses: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.binanceMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.polygonMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.optimismMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.arbitrumMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.auroraMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.gnosisMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.avalancheMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.fantomMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.klaytnMainnet]: '0x1111111254eeb25477b68fb85ed929f73a960582',
    [ChainId.zkSyncEraMainnet]: '0x165ccec4b340e36d6fea99765e35b5727ca60d8f',
} as const;

/**
 * @deprecated Change to `limitOrderProtocolAddresses`
 */
export const contractAddresses = limitOrderProtocolAddresses;
