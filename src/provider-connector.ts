import {EIP712TypedData} from './model/eip712.model';
import {AbiItem} from './model/abi.model';

export interface ProviderConnector {
    contractEncodeABI(
        abi: AbiItem[],
        address: string | null,
        methodName: string,
        methodParams: any[]
    ): string;

    contractCall<T>(
        abi: AbiItem[],
        contractAddress: string,
        methodName: string,
        methodParams: any[],
        blockNumber: 'pending' | 'latest' | number
    ): Promise<T>;

    signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string>;

    ethCall(contractAddress: string, callData: string): Promise<string>;

    decodeABIParameter(type: string, hex: string): {[key: string]: any};
}
