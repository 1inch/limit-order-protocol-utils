import {EIP712TypedData} from '../model/eip712.model';
import {AbiItem, AbiOutput} from '../model/abi.model';

export interface AbiDecodeResult {
    [key: string]: unknown,
}

export interface ProviderConnector {
    contractEncodeABI(
        abi: AbiItem[],
        address: string | null,
        methodName: string,
        methodParams: unknown[]
    ): string;

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData,
        typedDataHash: string
    ): Promise<string>;

    ethCall(contractAddress: string, callData: string): Promise<string>;

    decodeABIParameter<T>(type: AbiOutput | string, hex: string): T;

    decodeABICallParameters(types: Array<AbiOutput | string>, callData: string): AbiDecodeResult;
}
