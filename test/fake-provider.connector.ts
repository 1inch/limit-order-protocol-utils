import {EIP712TypedData, Web3ProviderConnector} from '../dist';
import {signTypedData_v4} from 'eth-sig-util';
import Web3 from 'web3';

export class FakeProviderConnector extends Web3ProviderConnector {
    constructor(public privateKey: string, web3Provider: Web3) {
        super(web3Provider);
    }

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string> {
        console.log(walletAddress);

        const result = signTypedData_v4(Buffer.from(this.privateKey, 'hex'), {
            data: typedData,
        } as any);

        return Promise.resolve(result);
    }
}
