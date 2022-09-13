import {AbiItem} from './model/abi.model';
import LimitOrderProtocolABISource from './abi/LimitOrderProtocol.json';
import ERC20ABISource from './abi/ERC20ABI.json';

export const PROTOCOL_NAME = '1inch Aggregation Router';

export const PROTOCOL_VERSION = '5';

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
