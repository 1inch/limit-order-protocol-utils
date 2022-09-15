"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderPredicateBuilder = void 0;
const limit_order_protocol_model_1 = require("./model/limit-order-protocol.model");
const limit_order_protocol_const_1 = require("./limit-order-protocol.const");
const limit_order_utils_1 = require("./utils/limit-order.utils");
class LimitOrderPredicateBuilder {
    constructor(facade) {
        this.facade = facade;
        this.and = (...predicates) => {
            const { offsets, data } = limit_order_utils_1.joinStaticCalls(predicates);
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.and, [
                offsets,
                data,
            ]);
        };
        this.or = (...predicates) => {
            const { offsets, data } = limit_order_utils_1.joinStaticCalls(predicates);
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.or, [
                offsets,
                data,
            ]);
        };
        this.eq = (value, callData) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.eq, [
                value,
                callData,
            ]);
        };
        this.lt = (value, callData) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.lt, [
                value,
                callData,
            ]);
        };
        this.gt = (value, callData) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.gt, [
                value,
                callData,
            ]);
        };
        this.nonceEquals = (makerAddress, makerNonce) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.nonceEquals, [makerAddress, makerNonce]);
        };
        this.timestampBelow = (timestamp) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.timestampBelow, [limit_order_protocol_const_1.ZX + timestamp.toString(16)]);
        };
        this.timestampBelowAndNonceEquals = (timestamp, nonce, address) => {
            const predicateValue = BigInt(address)
                + (BigInt(nonce) << BigInt(160))
                + (BigInt(timestamp) << BigInt(208));
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.timestampBelowAndNonceEquals, [limit_order_protocol_const_1.ZX + predicateValue.toString(16)]);
        };
    }
}
exports.LimitOrderPredicateBuilder = LimitOrderPredicateBuilder;
//# sourceMappingURL=limit-order-predicate.builder.js.map