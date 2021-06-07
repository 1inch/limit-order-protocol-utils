import {ERC20_ABI} from './limit-order-protocol.const';
import {ProviderConnector} from './connector/provider.connector';

export enum Erc20Methods {
    transferFrom = 'transferFrom',
    balanceOf = 'balanceOf',
}

export class Erc20Facade {
    constructor(private readonly providerConnector: ProviderConnector) {}

    transferFrom(
        makerAssetAddress: string | null,
        fromAddress: string,
        toAddress: string,
        value: string
    ): string {
        return this.providerConnector.contractEncodeABI(
            ERC20_ABI,
            makerAssetAddress,
            Erc20Methods.transferFrom,
            [fromAddress, toAddress, value]
        );
    }

    balanceOf(tokenAddress: string, walletAddress: string): string {
        return this.providerConnector.contractEncodeABI(
            ERC20_ABI,
            tokenAddress,
            Erc20Methods.balanceOf,
            [walletAddress]
        );
    }
}
