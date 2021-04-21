export class Web3ProviderConnector {
    constructor(web3Provider) {
        this.web3Provider = web3Provider;
    }
    contractEncodeABI(abi, address, methodName, methodParams) {
        const contract = new this.web3Provider.eth.Contract(abi, address === null
            ? undefined
            : address);
        return contract.methods[methodName](...methodParams).encodeABI();
    }
    contractCall(abi, contractAddress, methodName, methodParams, blockNumber) {
        const contract = new this.web3Provider.eth.Contract(abi, contractAddress);
        return contract.methods[methodName](...methodParams).call(null, blockNumber);
    }
    signTypedData(walletAddress, typedData) {
        if (!this.web3Provider.currentProvider) {
            throw new Error('Web3 currentProvider is null');
        }
        const currentProvider = this.web3Provider.currentProvider;
        // TODO: add fallback for other wallets
        return currentProvider.send('eth_signTypedData_v4', [
            walletAddress,
            JSON.stringify(typedData)
        ]);
    }
    ethCall(contractAddress, callData) {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData
        });
    }
    decodeABIParameter(type, hex) {
        return this.web3Provider.eth.abi.decodeParameter(type, hex);
    }
}
//# sourceMappingURL=web3-provider-connector.js.map