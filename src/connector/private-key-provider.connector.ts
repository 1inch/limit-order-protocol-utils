import {ProviderConnector, AbiDecodeResult} from './provider.connector';
import Web3 from 'web3';
import {EIP712TypedData} from '../model/eip712.model';
import {AbiItem, AbiOutput} from '../model/abi.model';
import {AbiItem as Web3AbiItem} from 'web3-utils';
import {signTypedData, SignTypedDataVersion} from '@metamask/eth-sig-util';
import { trim0x } from '../utils/limit-order.utils';

export class PrivateKeyProviderConnector implements ProviderConnector {
    constructor(
        private readonly privateKey: string,
        protected readonly web3Provider: Web3
    ) {}

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
        _walletAddress: string,
        typedData: EIP712TypedData,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _typedDataHash = ''
    ): Promise<string> {
        const result = signTypedData({
            privateKey: Buffer.from(this.privateKey, 'hex'),
            // @ts-ignore
            data: typedData,
            version: SignTypedDataVersion.V4,
        });

        return Promise.resolve(result);
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData,
        });
    }

    decodeABIParameter<T>(type: AbiOutput | string, hex: string): T {
        return this.web3Provider.eth.abi.decodeParameter(type, hex) as T;
    }

    decodeABICallParameters(types: Array<AbiOutput | string>, callData: string): AbiDecodeResult {
        const parameters = trim0x(callData).substring(8);
        return this.web3Provider.eth.abi.decodeParameters([...types], parameters);
    }
}
