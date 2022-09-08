"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMakingAmountForRFQ = exports.parseSimulateResult = exports.joinStaticCalls = exports.getOffsets = exports.trim0x = void 0;
const limit_order_protocol_const_1 = require("../limit-order-protocol.const");
function trim0x(hexString) {
    if (hexString.startsWith('0x')) {
        return hexString.substring(2);
    }
    return hexString;
}
exports.trim0x = trim0x;
// todo think about naming
function getOffsets(data) {
    return data
        .map(a => a.length / 2 - 1)
        .map(val => BigInt(val))
        .map(cumulativeSum)
        .reduce((acc, a, i) => {
        return acc + (BigInt(a) << ((BigInt(32) * BigInt(i))));
    }, BigInt(0))
        .toString();
}
exports.getOffsets = getOffsets;
function joinStaticCalls(data) {
    const trimmed = data.map(trim0x);
    return {
        offsets: getOffsets(trimmed),
        data: limit_order_protocol_const_1.ZX + trimmed.join(''),
    };
}
exports.joinStaticCalls = joinStaticCalls;
const cumulativeSum = ((sum) => (value) => {
    sum += value;
    return sum;
})(BigInt(0));
function parseSimulateResult(result) {
    const successResponseRegexp = /SimulationResults\((true|false),*.("0x\d*")\)/gi;
    const parsedResult = successResponseRegexp.exec(result);
    if ((parsedResult === null || parsedResult === void 0 ? void 0 : parsedResult.length) === 3) {
        return {
            success: parsedResult[1] === 'true',
            result: parsedResult[2],
        };
    }
    return null;
}
exports.parseSimulateResult = parseSimulateResult;
function getMakingAmountForRFQ(amount) {
    return setN(BigInt(amount), 255, true).toString();
}
exports.getMakingAmountForRFQ = getMakingAmountForRFQ;
function setN(value, bitNumber, flag) {
    const bit = flag ? 1 : 0;
    return value | (BigInt(bit) << BigInt(bitNumber));
}
//# sourceMappingURL=limit-order.utils.js.map