import { ProviderConnector } from './provider.connector';
import Web3 from 'web3';
import { EIP712TypedData } from '../model/eip712.model';
import { AbiItem } from '../model/abi.model';
export declare class PrivateKeyProviderConnector implements ProviderConnector {
    private readonly privateKey;
    protected readonly web3Provider: Web3;
    constructor(privateKey: string, web3Provider: Web3);
    contractEncodeABI(abi: AbiItem[], address: string | null, methodName: string, methodParams: unknown[]): string;
    signTypedData(_walletAddress: string, typedData: EIP712TypedData, _typedDataHash?: string): Promise<string>;
    ethCall(contractAddress: string, callData: string): Promise<string>;
    decodeABIParameter<T>(type: string, hex: string): T;
}
