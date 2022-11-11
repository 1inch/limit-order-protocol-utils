export interface CreatingParams {
    chainId: number;
    privateKey: string;
    orderId: number;
    expiresIn: number;
    makerAssetAddress: string;
    takerAssetAddress: string;
    makingAmount: string;
    takingAmount: string;
    /**
     * Formerly takerAddress
     */
    allowedSender?: string;
}

export interface FillingParams {
    chainId: number;
    privateKey: string;
    gasPrice: number;
    order: string;
    makingAmount: string;
    takingAmount: string;
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
