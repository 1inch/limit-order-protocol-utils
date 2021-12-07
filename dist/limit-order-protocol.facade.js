'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.LimitOrderProtocolFacade = void 0;
const limit_order_protocol_const_1 = require('./limit-order-protocol.const');
const limit_order_protocol_model_1 = require('./model/limit-order-protocol.model');
const bignumber_1 = require('@ethersproject/bignumber');
class LimitOrderProtocolFacade {
    constructor(contractAddress, providerConnector) {
        this.contractAddress = contractAddress;
        this.providerConnector = providerConnector;
    }
    fillLimitOrder(
        order,
        signature,
        makerAmount,
        takerAmount,
        thresholdAmount
    ) {
        return this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.fillOrder,
            [order, signature, makerAmount, takerAmount, thresholdAmount]
        );
    }
    fillRFQOrder(order, signature, makerAmount, takerAmount) {
        return this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.fillOrderRFQ,
            [order, signature, makerAmount, takerAmount]
        );
    }
    cancelLimitOrder(order) {
        return this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.cancelOrder,
            [order]
        );
    }
    cancelRFQOrder(orderInfo) {
        return this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods
                .cancelOrderRFQ,
            [orderInfo]
        );
    }
    nonce(makerAddress) {
        const callData = this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.nonce,
            [makerAddress]
        );
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((nonce) => bignumber_1.BigNumber.from(nonce).toNumber());
    }
    advanceNonce(count) {
        return this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.advanceNonce,
            [count]
        );
    }
    increaseNonce() {
        return this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.increaseNonce
        );
    }
    checkPredicate(order) {
        const callData = this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods
                .checkPredicate,
            [order]
        );
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .catch((error) => {
                console.error(error);
                return false;
            })
            .then((result) => {
                try {
                    return bignumber_1.BigNumber.from(result).toNumber() === 1;
                } catch (e) {
                    console.error(e);
                    return false;
                }
            });
    }
    remaining(orderHash) {
        const callData = this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods.remaining,
            [orderHash]
        );
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                const response = this.parseRemainingResponse(result);
                if (response !== null) {
                    return response;
                }
                // Parse error
                const parsed = this.parseContractResponse(result);
                return Promise.reject(parsed);
            });
    }
    simulateCalls(tokens, data) {
        const callData = this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods
                .simulateCalls,
            [tokens, data]
        );
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                const parsed = this.parseSimulateTransferResponse(result);
                if (parsed !== null) return parsed;
                return Promise.reject(result);
            })
            .catch((error) => {
                const parsed = this.parseSimulateTransferError(error);
                if (parsed !== null) return parsed;
                return Promise.reject(error);
            });
    }
    domainSeparator() {
        const callData = this.getContractCallData(
            limit_order_protocol_model_1.LimitOrderProtocolMethods
                .DOMAIN_SEPARATOR
        );
        return this.providerConnector.ethCall(this.contractAddress, callData);
    }
    getContractCallData(methodName, methodParams = []) {
        return this.providerConnector.contractEncodeABI(
            limit_order_protocol_const_1.LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }
    parseRemainingResponse(response) {
        if (response.length === 66) {
            return bignumber_1.BigNumber.from(response);
        }
        return null;
    }
    parseSimulateTransferResponse(response) {
        const parsed = this.parseContractResponse(response);
        if (
            parsed.startsWith(limit_order_protocol_const_1.CALL_RESULTS_PREFIX)
        ) {
            const data = parsed.replace(
                limit_order_protocol_const_1.CALL_RESULTS_PREFIX,
                ''
            );
            return !data.includes('0');
        }
        return null;
    }
    parseSimulateTransferError(error) {
        const message = this.stringifyError(error);
        const regex = new RegExp(
            '(' + limit_order_protocol_const_1.CALL_RESULTS_PREFIX + '\\d+)'
        );
        const match = message.match(regex);
        if (match) {
            return !match[0].includes('0');
        }
        return null;
    }
    parseContractResponse(response) {
        return this.providerConnector.decodeABIParameter(
            'string',
            limit_order_protocol_const_1.ZX + response.slice(10)
        );
    }
    stringifyError(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (error instanceof Error) {
            return error.toString();
        }
        return JSON.stringify(error);
    }
}
exports.LimitOrderProtocolFacade = LimitOrderProtocolFacade;
//# sourceMappingURL=limit-order-protocol.facade.js.map
