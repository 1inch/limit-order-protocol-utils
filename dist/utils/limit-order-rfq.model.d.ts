export interface CreatingParams {
    chainId: number;
    privateKey: string;
    orderId: number;
    expiresIn: number;
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    takerAddress?: string;
}
export interface FillingParams {
    chainId: number;
    privateKey: string;
    gasPrice: number;
    order: string;
    makerAmount: string;
    takerAmount: string;
    domainName?: string;
}
export interface CancelingParams {
    chainId: number;
    privateKey: string;
    gasPrice: number;
    orderInfo: string;
}
export interface OperationParams {
    operation: string;
}
