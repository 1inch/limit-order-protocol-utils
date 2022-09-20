"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateKeyProviderConnector = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
class PrivateKeyProviderConnector {
    constructor(privateKey, web3Provider) {
        this.privateKey = privateKey;
        this.web3Provider = web3Provider;
    }
    contractEncodeABI(abi, address, methodName, methodParams) {
        const contract = new this.web3Provider.eth.Contract(abi, address === null ? undefined : address);
        return contract.methods[methodName](...methodParams).encodeABI();
    }
    signTypedData(_walletAddress, typedData, 
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    _typedDataHash = '') {
        const result = eth_sig_util_1.signTypedData({
            privateKey: Buffer.from(this.privateKey, 'hex'),
            data: typedData,
            version: eth_sig_util_1.SignTypedDataVersion.V4,
        });
        return Promise.resolve(result);
    }
    ethCall(contractAddress, callData) {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData,
        });
    }
    decodeABIParameter(type, hex) {
        return this.web3Provider.eth.abi.decodeParameter(type, hex);
    }
}
exports.PrivateKeyProviderConnector = PrivateKeyProviderConnector;
//# sourceMappingURL=private-key-provider.connector.js.map