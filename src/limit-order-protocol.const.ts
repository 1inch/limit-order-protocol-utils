import {AbiItem} from './model/abi.model';
import LimitOrderProtocolABISource from './abi/LimitOrderProtocol.json';
import LimitOrderProtocolV3ABISource from './abi/LimitOrderProtocolV3.json';
import ERC20ABISource from './abi/ERC20ABI.json';
import {SignTypedDataVersion} from '@metamask/eth-sig-util';
import {limitOrderProtocolAddresses} from "./limit-order-protocol-addresses.const";

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
