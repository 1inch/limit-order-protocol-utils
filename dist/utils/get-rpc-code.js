"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRPCCode = void 0;
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
function getRPCCode(response) {
    const objectRegexp = /{(\n*|.*)*}/gi; // take all between { }
    const match = response.match(objectRegexp);
    const matched = match ? match[0] : null;
    const rpcError = matched ? parseErrorObject(matched) : null;
    const data = rpcError ? rpcError.data : null;
    return data ? extractCodeFromData(data) : null;
}
exports.getRPCCode = getRPCCode;
function extractCodeFromData(data) {
    const hexRegexp = /0[xX][0-9a-fA-F]+/;
    const matched = data.match(hexRegexp);
    const hex = matched === null || matched === void 0 ? void 0 : matched[0];
    return hex ? web3_1.default.utils.hexToAscii(hex) : null;
}
function parseErrorObject(errorObjectString) {
    try {
        return JSON.parse(errorObjectString);
    }
    catch (e) {
        return null;
    }
}
//# sourceMappingURL=get-rpc-code.js.map