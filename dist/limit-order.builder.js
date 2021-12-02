"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderBuilder = exports.generateRFQOrderInfo = exports.generateOrderSalt = void 0;
const limit_order_protocol_const_1 = require("./limit-order-protocol.const");
const limit_order_protocol_model_1 = require("./model/limit-order-protocol.model");
const eth_sig_util_1 = require("eth-sig-util");
const erc20_facade_1 = require("./erc20.facade");
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
        this.erc20Facade = new erc20_facade_1.Erc20Facade(this.providerConnector);
    }
    buildOrderSignature(walletAddress, typedData) {
        const dataHash = eth_sig_util_1.TypedDataUtils.hashStruct(typedData.primaryType, typedData.message, typedData.types, true).toString('hex');
        return this.providerConnector.signTypedData(walletAddress, typedData, dataHash);
    }
    buildLimitOrderHash(orderTypedData) {
        const message = orderTypedData;
        return limit_order_protocol_const_1.ZX + eth_sig_util_1.TypedDataUtils.sign(message).toString('hex');
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
    buildLimitOrder({ makerAssetAddress, takerAssetAddress, makerAddress, receiver = limit_order_protocol_const_1.ZERO_ADDRESS, takerAddress = limit_order_protocol_const_1.ZERO_ADDRESS, makerAmount, takerAmount, predicate = limit_order_protocol_const_1.ZX, permit = limit_order_protocol_const_1.ZX, interaction = limit_order_protocol_const_1.ZX, }) {
        return {
            salt: this.generateSalt(),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            receiver,
            allowedSender: takerAddress,
            makingAmount: makerAmount,
            takingAmount: takerAmount,
            makerAssetData: this.erc20Facade.transferFrom(null, makerAddress, takerAddress, makerAmount),
            takerAssetData: this.erc20Facade.transferFrom(null, takerAddress, makerAddress, takerAmount),
            getMakerAmount: this.getAmountData(limit_order_protocol_model_1.LimitOrderProtocolMethods.getMakerAmount, makerAmount, takerAmount),
            getTakerAmount: this.getAmountData(limit_order_protocol_model_1.LimitOrderProtocolMethods.getTakerAmount, makerAmount, takerAmount),
            predicate,
            permit,
            interaction,
        };
    }
    /* eslint-enable max-lines-per-function */
    // Get nonce from contract (nonce method) and put it to predicate on order creating
    getAmountData(methodName, makerAmount, takerAmount, swapTakerAmount = '0') {
        return this.getContractCallData(methodName, [
            makerAmount,
            takerAmount,
            swapTakerAmount,
        ]).substr(0, 2 + 68 * 2);
    }
    getContractCallData(methodName, methodParams = []) {
        return this.providerConnector.contractEncodeABI(limit_order_protocol_const_1.LIMIT_ORDER_PROTOCOL_ABI, this.contractAddress, methodName, methodParams);
    }
}
exports.LimitOrderBuilder = LimitOrderBuilder;
//# sourceMappingURL=limit-order.builder.js.map