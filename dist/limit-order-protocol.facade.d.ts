import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature,
    RFQOrderInfo,
    RFQOrder,
} from './model/limit-order-protocol.model';
import {ProviderConnector} from './connector/provider.connector';
import {BigNumber} from '@ethersproject/bignumber';
export declare class LimitOrderProtocolFacade {
    readonly contractAddress: string;
    readonly providerConnector: ProviderConnector;
    constructor(contractAddress: string, providerConnector: ProviderConnector);
    fillLimitOrder(
        order: LimitOrder,
        signature: LimitOrderSignature,
        makerAmount: string,
        takerAmount: string,
        thresholdAmount: string
    ): string;
    fillRFQOrder(
        order: RFQOrder,
        signature: LimitOrderSignature,
        makerAmount: string,
        takerAmount: string
    ): string;
    cancelLimitOrder(order: LimitOrder): string;
    cancelRFQOrder(orderInfo: RFQOrderInfo): string;
    nonce(makerAddress: string): Promise<number>;
    advanceNonce(count: number): string;
    increaseNonce(): string;
    checkPredicate(order: LimitOrder): Promise<boolean>;
    remaining(orderHash: LimitOrderHash): Promise<BigNumber>;
    simulateCalls(tokens: string[], data: unknown[]): Promise<boolean>;
    domainSeparator(): Promise<string>;
    getContractCallData(
        methodName: LimitOrderProtocolMethods,
        methodParams?: unknown[]
    ): string;
    parseRemainingResponse(response: string): BigNumber | null;
    parseSimulateTransferResponse(response: string): boolean | null;
    parseSimulateTransferError(error: Error | string): boolean | null;
    parseContractResponse(response: string): string;
    private stringifyError;
}
