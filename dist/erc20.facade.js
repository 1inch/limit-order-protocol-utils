"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20Facade = exports.Erc20Methods = void 0;
const limit_order_protocol_const_1 = require("./limit-order-protocol.const");
var Erc20Methods;
(function (Erc20Methods) {
    Erc20Methods["transferFrom"] = "transferFrom";
    Erc20Methods["balanceOf"] = "balanceOf";
})(Erc20Methods = exports.Erc20Methods || (exports.Erc20Methods = {}));
class Erc20Facade {
    constructor(providerConnector) {
        this.providerConnector = providerConnector;
    }
    balanceOf(tokenAddress, walletAddress) {
        return this.providerConnector.contractEncodeABI(limit_order_protocol_const_1.ERC20_ABI, tokenAddress, Erc20Methods.balanceOf, [walletAddress]);
    }
}
exports.Erc20Facade = Erc20Facade;
//# sourceMappingURL=erc20.facade.js.map