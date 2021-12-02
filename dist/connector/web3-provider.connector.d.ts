import { ProviderConnector } from './provider.connector';
import Web3 from 'web3';
import { EIP712TypedData } from '../model/eip712.model';
import { AbiItem } from '../model/abi.model';
export declare class Web3ProviderConnector implements ProviderConnector {
    protected readonly web3Provider: Web3;
    constructor(web3Provider: Web3);
    contractEncodeABI(abi: AbiItem[], address: string | null, methodName: string, methodParams: unknown[]): string;
    signTypedData(walletAddress: string, typedData: EIP712TypedData, _typedDataHash: string): Promise<string>;
    ethCall(contractAddress: string, callData: string): Promise<string>;
    decodeABIParameter<T>(type: string, hex: string): T;
}
