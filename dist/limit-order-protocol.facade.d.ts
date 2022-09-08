import { LimitOrder, LimitOrderProtocolMethods, LimitOrderHash, LimitOrderSignature, RFQOrderInfo, RFQOrder } from './model/limit-order-protocol.model';
import { ProviderConnector } from './connector/provider.connector';
import { BigNumber } from '@ethersproject/bignumber';
export interface FillOrderParams {
    order: LimitOrder;
    signature: LimitOrderSignature;
    interaction?: string;
    makingAmount: string;
    takingAmount: string;
    skipPermitAndThresholdAmount: string;
}
export declare type FillLimitOrderWithPermitParams = FillOrderParams & {
    targetAddress: string;
    permit: string;
};
export declare class LimitOrderProtocolFacade {
    readonly contractAddress: string;
    readonly providerConnector: ProviderConnector;
    constructor(contractAddress: string, providerConnector: ProviderConnector);
    fillLimitOrder(params: FillOrderParams): string;
    fillOrderToWithPermit(params: FillLimitOrderWithPermitParams): string;
    fillRFQOrder(order: RFQOrder, signature: LimitOrderSignature, makerAmount?: string, takerAmount?: string): string;
    cancelLimitOrder(order: LimitOrder): string;
    cancelRFQOrder(orderInfo: RFQOrderInfo): string;
    nonce(makerAddress: string): Promise<number>;
    advanceNonce(count: number): string;
    increaseNonce(): string;
    checkPredicate(order: LimitOrder): Promise<boolean>;
    remaining(orderHash: LimitOrderHash): Promise<BigNumber>;
    simulate(targetAddress: string, data: unknown): Promise<{
        success: boolean;
        result: string;
    }>;
    domainSeparator(): Promise<string>;
    getContractCallData(methodName: LimitOrderProtocolMethods, methodParams?: unknown[]): string;
    parseRemainingResponse(response: string): BigNumber | null;
    parseSimulateTransferResponse(response: string): boolean | null;
    parseSimulateTransferError(error: Error | string): boolean | null;
    parseContractResponse(response: string): string;
    private isMsgContainsCorrectCode;
    private stringifyError;
}
