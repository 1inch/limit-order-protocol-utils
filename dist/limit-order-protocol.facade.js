"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderProtocolFacade = void 0;
const limit_order_protocol_const_1 = require("./limit-order-protocol.const");
const limit_order_protocol_model_1 = require("./model/limit-order-protocol.model");
const bignumber_1 = require("@ethersproject/bignumber");
const get_rpc_code_1 = require("./utils/get-rpc-code");
const limit_order_utils_1 = require("./utils/limit-order.utils");
class LimitOrderProtocolFacade {
    constructor(contractAddress, providerConnector) {
        this.contractAddress = contractAddress;
        this.providerConnector = providerConnector;
    }
    fillLimitOrder(params) {
        const { order, interaction = limit_order_protocol_const_1.ZX, signature, makingAmount, takingAmount, skipPermitAndThresholdAmount, } = params;
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.fillOrder, [
            order,
            signature,
            interaction,
            makingAmount,
            takingAmount,
            skipPermitAndThresholdAmount,
        ]);
    }
    // todo
    // eslint-disable-next-line max-lines-per-function
    fillOrderToWithPermit(params) {
        const { order, signature, makingAmount, takingAmount, interaction = limit_order_protocol_const_1.ZX, skipPermitAndThresholdAmount, targetAddress, permit, } = params;
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.fillOrderToWithPermit, [
            order,
            signature,
            interaction,
            makingAmount,
            takingAmount,
            skipPermitAndThresholdAmount,
            targetAddress,
            permit
        ]);
    }
    fillRFQOrder(order, signature, makerAmount, takerAmount) {
        let flagsAndAmount = '0';
        if (makerAmount) {
            flagsAndAmount = limit_order_utils_1.getMakingAmountForRFQ(makerAmount);
        }
        else if (takerAmount) {
            flagsAndAmount = takerAmount;
        }
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.fillOrderRFQ, [order, signature, flagsAndAmount]);
    }
    cancelLimitOrder(order) {
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.cancelOrder, [
            order,
        ]);
    }
    cancelRFQOrder(orderInfo) {
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.cancelOrderRFQ, [orderInfo]);
    }
    nonce(makerAddress) {
        const callData = this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.nonce, [makerAddress]);
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((nonce) => bignumber_1.BigNumber.from(nonce).toNumber());
    }
    advanceNonce(count) {
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.advanceNonce, [count]);
    }
    increaseNonce() {
        return this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.increaseNonce);
    }
    checkPredicate(order) {
        const callData = this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.checkPredicate, [order]);
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .catch((error) => {
            console.error(error);
            return false;
        })
            .then((result) => {
            try {
                return bignumber_1.BigNumber.from(result).toNumber() === 1;
            }
            catch (e) {
                console.error(e);
                return false;
            }
        });
    }
    remaining(orderHash) {
        const callData = this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.remaining, [orderHash]);
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
    // eslint-disable-next-line max-lines-per-function
    simulate(targetAddress, data) {
        const callData = this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.simulate, [targetAddress, data]);
        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            // todo is it possible ?
            .then((result) => {
            const parsedResult = limit_order_utils_1.parseSimulateResult(result);
            if (parsedResult) {
                return parsedResult;
            }
            throw result;
        })
            .catch((result) => {
            const parsedResult = limit_order_utils_1.parseSimulateResult(result);
            if (parsedResult) {
                return parsedResult;
            }
            throw result;
        });
    }
    domainSeparator() {
        const callData = this.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.DOMAIN_SEPARATOR);
        return this.providerConnector.ethCall(this.contractAddress, callData);
    }
    getContractCallData(methodName, methodParams = []) {
        return this.providerConnector.contractEncodeABI(limit_order_protocol_const_1.LIMIT_ORDER_PROTOCOL_ABI, this.contractAddress, methodName, methodParams);
    }
    parseRemainingResponse(response) {
        if (response.length === 66) {
            return bignumber_1.BigNumber.from(response);
        }
        return null;
    }
    parseSimulateTransferResponse(response) {
        const parsed = this.parseContractResponse(response);
        if (parsed.startsWith(limit_order_protocol_const_1.CALL_RESULTS_PREFIX)) {
            const data = parsed.replace(limit_order_protocol_const_1.CALL_RESULTS_PREFIX, '');
            return !data.includes('0');
        }
        return null;
    }
    parseSimulateTransferError(error) {
        const message = this.stringifyError(error);
        const isCorrectCode = this.isMsgContainsCorrectCode(message);
        if (isCorrectCode !== null) {
            return isCorrectCode;
        }
        try {
            const code = get_rpc_code_1.getRPCCode(message);
            return code ? this.isMsgContainsCorrectCode(code) : null;
        }
        catch (e) {
            return null;
        }
    }
    parseContractResponse(response) {
        // Aurora network wraps revert message into Revert()
        const matched = response.match(/Revert\(([^)]+)\)/);
        const message = matched && matched[1] ? matched[1] : response;
        return this.providerConnector.decodeABIParameter('string', limit_order_protocol_const_1.ZX + message.slice(10));
    }
    isMsgContainsCorrectCode(message) {
        const regex = new RegExp('(' + limit_order_protocol_const_1.CALL_RESULTS_PREFIX + '\\d+)');
        const matched = message.match(regex);
        if (matched) {
            return !matched[0].includes('0');
        }
        else {
            try {
                const matchParsed = this.parseContractResponse(message).match(regex);
                if (matchParsed) {
                    return !matchParsed[0].includes('0');
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        return null;
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