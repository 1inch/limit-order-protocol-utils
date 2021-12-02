"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RFQ_ORDER_STRUCTURE = exports.ORDER_STRUCTURE = exports.EIP712_DOMAIN = exports.ERC20_ABI = exports.LIMIT_ORDER_PROTOCOL_ABI = exports.CALL_RESULTS_PREFIX = exports.ZERO_ADDRESS = exports.ZX = exports.PROTOCOL_VERSION = exports.PROTOCOL_NAME = void 0;
const tslib_1 = require("tslib");
const LimitOrderProtocol_json_1 = tslib_1.__importDefault(require("./abi/LimitOrderProtocol.json"));
const ERC20ABI_json_1 = tslib_1.__importDefault(require("./abi/ERC20ABI.json"));
exports.PROTOCOL_NAME = '1inch Limit Order Protocol';
exports.PROTOCOL_VERSION = '2';
exports.ZX = '0x';
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
exports.CALL_RESULTS_PREFIX = 'CALL_RESULTS_';
exports.LIMIT_ORDER_PROTOCOL_ABI = LimitOrderProtocol_json_1.default;
exports.ERC20_ABI = ERC20ABI_json_1.default;
exports.EIP712_DOMAIN = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];
exports.ORDER_STRUCTURE = [
    { name: 'salt', type: 'uint256' },
    { name: 'makerAsset', type: 'address' },
    { name: 'takerAsset', type: 'address' },
    { name: 'maker', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'allowedSender', type: 'address' },
    { name: 'makingAmount', type: 'uint256' },
    { name: 'takingAmount', type: 'uint256' },
    { name: 'makerAssetData', type: 'bytes' },
    { name: 'takerAssetData', type: 'bytes' },
    { name: 'getMakerAmount', type: 'bytes' },
    { name: 'getTakerAmount', type: 'bytes' },
    { name: 'predicate', type: 'bytes' },
    { name: 'permit', type: 'bytes' },
    { name: 'interaction', type: 'bytes' },
];
exports.RFQ_ORDER_STRUCTURE = [
    { name: 'info', type: 'uint256' },
    { name: 'makerAsset', type: 'address' },
    { name: 'takerAsset', type: 'address' },
    { name: 'maker', type: 'address' },
    { name: 'allowedSender', type: 'address' },
    { name: 'makingAmount', type: 'uint256' },
    { name: 'takingAmount', type: 'uint256' },
];
//# sourceMappingURL=limit-order-protocol.const.js.map