#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const prompts_1 = tslib_1.__importDefault(require("prompts"));
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const limit_order_rfq_const_1 = require("./limit-order-rfq.const");
const limit_order_rfq_helpers_1 = require("./limit-order-rfq.helpers");
const allSchemas = [
    limit_order_rfq_const_1.cancelOrderSchema,
    limit_order_rfq_const_1.createOrderSchema,
    limit_order_rfq_const_1.fillOrderSchema,
    limit_order_rfq_const_1.operationSchema,
];
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const argvKeys = Object.keys(yargs_1.default.argv);
    const isRunningWithArgv = allSchemas.some((schema) => {
        return schema
            .map((i) => i.name)
            .every((param) => argvKeys.includes(param));
    });
    prompts_1.default.override(yargs_1.default.argv);
    const operationResult = (yield prompts_1.default(limit_order_rfq_const_1.operationSchema));
    switch (operationResult.operation) {
        case 'create':
            yield limit_order_rfq_helpers_1.createOrderOperation(isRunningWithArgv);
            break;
        case 'fill':
            yield limit_order_rfq_helpers_1.fillOrderOperation(isRunningWithArgv);
            break;
        case 'cancel':
            yield limit_order_rfq_helpers_1.cancelOrderOperation(isRunningWithArgv);
            break;
        default:
            console.log('Unknown operation: ', operationResult.operation);
            break;
    }
}))();
//# sourceMappingURL=limit-order-rfq.utils.js.map