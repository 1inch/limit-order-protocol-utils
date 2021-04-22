import {ProviderConnector} from './provider.connector';
import Web3 from 'web3';
import {EIP712TypedData} from '../model/eip712.model';
import {AbiItem} from '../model/abi.model';
import {AbiItem as Web3AbiItem} from 'web3-utils';

export class Web3ProviderConnector implements ProviderConnector {
    constructor(private readonly web3Provider: Web3) {
    }

    contractEncodeABI(
        abi: AbiItem[],
        address: string | null,
        methodName: string,
        methodParams: any[]
    ): string {
        const contract = new this.web3Provider.eth.Contract(
            abi as Web3AbiItem[],
            address === null
                ? undefined
                : address
        );

        return contract.methods[methodName](...methodParams).encodeABI();
    }

    contractCall<T>(
        abi: AbiItem[],
        contractAddress: string,
        methodName: string,
        methodParams: any[],
        blockNumber: 'pending' | 'latest' | number
    ): Promise<T> {
        const contract = new this.web3Provider.eth.Contract(
            abi as Web3AbiItem[],
            contractAddress
        );

        return contract.methods[methodName](...methodParams).call(null, blockNumber);
    }

    signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string> {
        if (!this.web3Provider.currentProvider) {
            throw new Error('Web3 currentProvider is null');
        }

        const currentProvider: any = this.web3Provider.currentProvider;

        // TODO: add fallback for other wallets
        return currentProvider.send('eth_signTypedData_v4', [
            walletAddress,
            JSON.stringify(typedData)
        ]);
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData
        });
    }

    decodeABIParameter(type: string, hex: string): { [key: string]: any } {
        return this.web3Provider.eth.abi.decodeParameter(type, hex);
    }
}
