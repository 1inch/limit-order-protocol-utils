import { ProviderConnector } from './connector/provider.connector';
export declare enum Erc20Methods {
    transferFrom = "transferFrom",
    balanceOf = "balanceOf"
}
export declare class Erc20Facade {
    private readonly providerConnector;
    constructor(providerConnector: ProviderConnector);
    balanceOf(tokenAddress: string, walletAddress: string): string;
}
