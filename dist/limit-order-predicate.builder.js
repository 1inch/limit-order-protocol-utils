"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderPredicateBuilder = void 0;
const limit_order_protocol_model_1 = require("./model/limit-order-protocol.model");
const limit_order_protocol_const_1 = require("./limit-order-protocol.const");
class LimitOrderPredicateBuilder {
    constructor(facade) {
        this.facade = facade;
        this.and = (...predicates) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.and, [
                predicates.map(() => this.facade.contractAddress),
                predicates,
            ]);
        };
        this.or = (...predicates) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.or, [
                predicates.map(() => this.facade.contractAddress),
                predicates,
            ]);
        };
        this.eq = (value, address, callData) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.eq, [
                value,
                address,
                callData,
            ]);
        };
        this.lt = (value, address, callData) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.lt, [
                value,
                address,
                callData,
            ]);
        };
        this.gt = (value, address, callData) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.gt, [
                value,
                address,
                callData,
            ]);
        };
        this.nonceEquals = (makerAddress, makerNonce) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.nonceEquals, [makerAddress, makerNonce]);
        };
        this.timestampBelow = (timestamp) => {
            return this.facade.getContractCallData(limit_order_protocol_model_1.LimitOrderProtocolMethods.timestampBelow, [limit_order_protocol_const_1.ZX + timestamp.toString(16)]);
        };
    }
}
exports.LimitOrderPredicateBuilder = LimitOrderPredicateBuilder;
//# sourceMappingURL=limit-order-predicate.builder.js.map