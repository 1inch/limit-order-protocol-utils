import { EIP712_DOMAIN, ORDER_STRUCTURE, PROTOCOL_VERSION, ZERO_ADDRESS, PROTOCOL_NAME, LIMIT_ORDER_PROTOCOL_ABI, ERC20_ABI, ZX } from './limit-order-protocol.const';
import { LimitOrderProtocolMethods } from './model/limit-order-protocol.model';
import { TypedDataUtils } from 'eth-sig-util';
import { BigNumber } from '@ethersproject/bignumber';
export class LimitOrderProtocolUtils {
    constructor(contractAddress, chainId, providerConnector) {
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.providerConnector = providerConnector;
    }
    getOrderSignature(walletAddress, typedData) {
        return this.providerConnector.signTypedData(walletAddress, typedData);
    }
    getOrderHash(orderTypedData) {
        return ZX + TypedDataUtils.sign(orderTypedData).toString('hex');
    }
    buildOrderTypedData(order) {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE
            },
            domain: {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress
            },
            message: order,
        };
    }
    buildOrder(data) {
        const { makerAssetAddress, takerAssetAddress, makerAddress, takerAddress = ZERO_ADDRESS, makerAmount, takerAmount, predicate = ZX, permit = ZX, interaction = ZX } = data;
        return {
            salt: this.generateSalt(),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            makerAssetData: this.transferFrom(makerAssetAddress, makerAddress, takerAddress, makerAmount),
            takerAssetData: this.transferFrom(makerAssetAddress, takerAddress, makerAddress, takerAmount),
            getMakerAmount: this.getAmountData(LimitOrderProtocolMethods.getMakerAmount, makerAmount, takerAmount),
            getTakerAmount: this.getAmountData(LimitOrderProtocolMethods.getTakerAmount, makerAmount, takerAmount),
            predicate,
            permit,
            interaction
        };
    }
    fillOrder(order, signature, makerAmount, takerAmount) {
        return this.getContractCallData(LimitOrderProtocolMethods.fillOrder, [
            order,
            signature,
            makerAmount,
            takerAmount
        ]);
    }
    cancelOrder(order) {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            order
        ]);
    }
    nonces(makerAddress) {
        const callData = this.getContractCallData(LimitOrderProtocolMethods.nonces, [
            makerAddress
        ]);
        return this.providerConnector.ethCall(this.contractAddress, callData)
            .then(nonce => BigNumber.from(nonce).toNumber());
    }
    advanceNonce() {
        return this.getContractCallData(LimitOrderProtocolMethods.advanceNonce);
    }
    andPredicate(predicates) {
        return this.getContractCallData(LimitOrderProtocolMethods.and, [
            predicates.map(() => this.contractAddress),
            predicates
        ]);
    }
    timestampBelow(timestamp) {
        return this.getContractCallData(LimitOrderProtocolMethods.timestampBelow, [
            timestamp
        ]);
    }
    nonceEquals(makerAddress, makerNonce) {
        return this.getContractCallData(LimitOrderProtocolMethods.nonceEquals, [
            makerAddress,
            makerNonce
        ]);
    }
    remaining(hash) {
        const callData = this.getContractCallData(LimitOrderProtocolMethods.remaining, [
            hash
        ]);
        return this.providerConnector.ethCall(this.contractAddress, callData)
            .then(result => {
            if (result.length === 66) {
                return BigNumber.from(result);
            }
            // Parse error
            const parsed = this.providerConnector.decodeABIParameter('string', ZX + result.slice(10));
            return Promise.reject(parsed);
        });
    }
    remainingsRaw(hashes) {
        return this.providerConnector.contractCall(LIMIT_ORDER_PROTOCOL_ABI, this.contractAddress, LimitOrderProtocolMethods.remainingsRaw, [hashes], 'latest');
    }
    generateSalt() {
        return Math.round(Math.random() * Date.now()) + '';
    }
    transferFrom(makerAssetAddress, fromAddress, toAddress, value) {
        return this.providerConnector.contractEncodeABI(ERC20_ABI, makerAssetAddress, 'transferFrom', [
            fromAddress,
            toAddress,
            value,
        ]);
    }
    // Get nonce from contract (nonces method) and put it to predicate on order creating
    getAmountData(methodName, makerAmount, takerAmount, swapTakerAmount = '0') {
        return this.getContractCallData(methodName, [
            makerAmount,
            takerAmount,
            swapTakerAmount
        ]).substr(0, 2 + 68 * 2);
    }
    getContractCallData(methodName, methodParams = []) {
        return this.providerConnector.contractEncodeABI(LIMIT_ORDER_PROTOCOL_ABI, this.contractAddress, methodName, methodParams);
    }
}
//# sourceMappingURL=limit-order-protocol-utils.js.map