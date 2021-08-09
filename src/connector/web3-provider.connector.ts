import {ProviderConnector} from './provider.connector';
import Web3 from 'web3';
import {EIP712TypedData} from '../model/eip712.model';
import {AbiItem} from '../model/abi.model';
import {AbiItem as Web3AbiItem} from 'web3-utils';

interface ExtendedWeb3 extends Web3 {
    signTypedDataV4(walletAddress: string, typedData: string): Promise<string>;
}

export class Web3ProviderConnector implements ProviderConnector {
    constructor(protected readonly web3Provider: Web3) {}

    contractEncodeABI(
        abi: AbiItem[],
        address: string | null,
        methodName: string,
        methodParams: unknown[]
    ): string {
        const contract = new this.web3Provider.eth.Contract(
            abi as Web3AbiItem[],
            address === null ? undefined : address
        );

        return contract.methods[methodName](...methodParams).encodeABI();
    }

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _typedDataHash: string
    ): Promise<string> {
        const extendedWeb3: ExtendedWeb3 = this.web3Provider.extend({
            methods: [
                {
                    name: 'signTypedDataV4',
                    call: 'eth_signTypedData_v4',
                    params: 2,
                },
            ],
        });

        return extendedWeb3.signTypedDataV4(
            walletAddress,
            JSON.stringify(typedData)
        );
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData,
        });
    }

    decodeABIParameter<T>(type: string, hex: string): T {
        return this.web3Provider.eth.abi.decodeParameter(type, hex) as T;
    }
}
