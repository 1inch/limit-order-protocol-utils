"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderBuilder = exports.generateRFQOrderInfo = exports.generateOrderSalt = void 0;
const limit_order_protocol_const_1 = require("./limit-order-protocol.const");
const limit_order_protocol_model_1 = require("./model/limit-order-protocol.model");
const ethereumjs_util_1 = require("ethereumjs-util");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const limit_order_utils_1 = require("./utils/limit-order.utils");
function generateOrderSalt() {
    return Math.round(Math.random() * Date.now()) + '';
}
exports.generateOrderSalt = generateOrderSalt;
function generateRFQOrderInfo(id, expiresInTimestamp, wrapEth) {
    const info = (BigInt(expiresInTimestamp) << BigInt(64)) | BigInt(id);
    if (wrapEth) {
        return (info | (BigInt(1) << BigInt(255))).toString(10);
    }
    return info.toString(10);
}
exports.generateRFQOrderInfo = generateRFQOrderInfo;
class LimitOrderBuilder {
    constructor(contractAddress, chainId, providerConnector, generateSalt = generateOrderSalt) {
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.providerConnector = providerConnector;
        this.generateSalt = generateSalt;
    }
    buildOrderSignature(walletAddress, typedData) {
        const dataHash = eth_sig_util_1.TypedDataUtils.hashStruct(typedData.primaryType, typedData.message, typedData.types, eth_sig_util_1.SignTypedDataVersion.V4).toString('hex');
        return this.providerConnector.signTypedData(walletAddress, typedData, dataHash);
    }
    buildLimitOrderHash(orderTypedData) {
        const message = orderTypedData;
        const hash = ethereumjs_util_1.bufferToHex(eth_sig_util_1.TypedDataUtils.eip712Hash(message, eth_sig_util_1.SignTypedDataVersion.V4));
        return limit_order_protocol_const_1.ZX + hash.substring(2);
    }
    buildLimitOrderTypedData(order, domainName = limit_order_protocol_const_1.PROTOCOL_NAME) {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: limit_order_protocol_const_1.EIP712_DOMAIN,
                Order: limit_order_protocol_const_1.ORDER_STRUCTURE,
            },
            domain: {
                name: domainName,
                version: limit_order_protocol_const_1.PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }
    buildRFQOrderTypedData(order, domainName = limit_order_protocol_const_1.PROTOCOL_NAME) {
        return {
            primaryType: 'OrderRFQ',
            types: {
                EIP712Domain: limit_order_protocol_const_1.EIP712_DOMAIN,
                OrderRFQ: limit_order_protocol_const_1.RFQ_ORDER_STRUCTURE,
            },
            domain: {
                name: domainName,
                version: limit_order_protocol_const_1.PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }
    /* eslint-disable max-lines-per-function */
    buildRFQOrder({ id, wrapEth = false, expiresInTimestamp, makerAssetAddress, takerAssetAddress, makerAddress, takerAddress = limit_order_protocol_const_1.ZERO_ADDRESS, makerAmount, takerAmount, }) {
        return {
            info: generateRFQOrderInfo(id, expiresInTimestamp, wrapEth),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            allowedSender: takerAddress,
            makingAmount: makerAmount,
            takingAmount: takerAmount,
        };
    }
    /* eslint-enable max-lines-per-function */
    /* eslint-disable max-lines-per-function */
    buildLimitOrder({ makerAssetAddress, takerAssetAddress, makerAddress, receiver = limit_order_protocol_const_1.ZERO_ADDRESS, takerAddress = limit_order_protocol_const_1.ZERO_ADDRESS, makerAmount, takerAmount, predicate = limit_order_protocol_const_1.ZX, permit = limit_order_protocol_const_1.ZX, 
    // todo
    // interaction = ZX, // ???
    preInteraction = limit_order_protocol_const_1.ZX, // ???
    postInteraction = limit_order_protocol_const_1.ZX, // ???
     }) {
        const makerAssetData = limit_order_protocol_const_1.ZX;
        const takerAssetData = limit_order_protocol_const_1.ZX;
        const getMakingAmount = this.getAmountData(limit_order_protocol_model_1.LimitOrderProtocolMethods.getMakingAmount, makerAmount, takerAmount);
        const getTakingAmount = this.getAmountData(limit_order_protocol_model_1.LimitOrderProtocolMethods.getTakingAmount, makerAmount, takerAmount);
        const allInteractions = [
            makerAssetData,
            takerAssetData,
            getMakingAmount,
            getTakingAmount,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        ];
        const interactions = limit_order_protocol_const_1.ZX + allInteractions.map(limit_order_utils_1.trim0x).join('');
        const offsets = limit_order_utils_1.getOffsets(allInteractions);
        return {
            salt: this.generateSalt(),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            receiver,
            allowedSender: takerAddress,
            makingAmount: makerAmount,
            takingAmount: takerAmount,
            offsets,
            interactions,
        };
    }
    /* eslint-enable max-lines-per-function */
    getContractCallData(methodName, methodParams = []) {
        return this.providerConnector.contractEncodeABI(limit_order_protocol_const_1.LIMIT_ORDER_PROTOCOL_ABI, this.contractAddress, methodName, methodParams);
    }
    // Get nonce from contract (nonce method) and put it to predicate on order creating
    getAmountData(methodName, makerAmount, takerAmount, swapTakerAmount = '0') {
        return this.getContractCallData(methodName, [
            makerAmount,
            takerAmount,
            swapTakerAmount,
        ]).substr(0, 2 + 68 * 2);
    }
}
exports.LimitOrderBuilder = LimitOrderBuilder;
//# sourceMappingURL=limit-order.builder.js.map