"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3ProviderConnector = void 0;
class Web3ProviderConnector {
    constructor(web3Provider) {
        this.web3Provider = web3Provider;
    }
    contractEncodeABI(abi, address, methodName, methodParams) {
        const contract = new this.web3Provider.eth.Contract(abi, address === null ? undefined : address);
        return contract.methods[methodName](...methodParams).encodeABI();
    }
    signTypedData(walletAddress, typedData, 
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    _typedDataHash) {
        const extendedWeb3 = this.web3Provider.extend({
            methods: [
                {
                    name: 'signTypedDataV4',
                    call: 'eth_signTypedData_v4',
                    params: 2,
                },
            ],
        });
        return extendedWeb3.signTypedDataV4(walletAddress, JSON.stringify(typedData));
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
exports.Web3ProviderConnector = Web3ProviderConnector;
//# sourceMappingURL=web3-provider.connector.js.map