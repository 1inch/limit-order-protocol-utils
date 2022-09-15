import { EIP712Object } from './eip712.model';
import { LimitOrderPredicateCallData } from '../limit-order-predicate.builder';
export declare enum ChainId {
    etherumMainnet = 1,
    binanceMainnet = 56,
    polygonMainnet = 137,
    optimismMainnet = 10,
    arbitrumMainnet = 42161
}
export declare type LimitOrderSignature = string;
export declare type LimitOrderHash = string;
export declare type RFQOrderInfo = string;
export interface LimitOrderData {
    makerAddress: string;
    receiver?: string;
    takerAddress?: string;
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    predicate?: LimitOrderPredicateCallData;
    permit?: string;
    interaction?: string;
    preInteraction?: string;
    postInteraction?: string;
}
export interface RFQOrderData {
    id: number;
    wrapEth?: boolean;
    expiresInTimestamp: number;
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    makerAddress: string;
    takerAddress?: string;
}
export interface LimitOrder extends EIP712Object {
    salt: string;
    makerAsset: string;
    takerAsset: string;
    maker: string;
    receiver: string;
    allowedSender: string;
    makingAmount: string;
    takingAmount: string;
    offsets: string;
    interactions: string;
}
export interface RFQOrder extends EIP712Object {
    info: RFQOrderInfo;
    makerAsset: string;
    takerAsset: string;
    maker: string;
    allowedSender: string;
    makingAmount: string;
    takingAmount: string;
}
export declare enum LimitOrderProtocolMethods {
    getMakingAmount = "getMakingAmount",
    getTakingAmount = "getTakingAmount",
    arbitraryStaticCall = "arbitraryStaticCall",
    fillOrder = "fillOrder",
    fillOrderToWithPermit = "fillOrderToWithPermit",
    fillOrderRFQ = "fillOrderRFQ",
    cancelOrder = "cancelOrder",
    cancelOrderRFQ = "cancelOrderRFQ",
    nonce = "nonce",
    advanceNonce = "advanceNonce",
    increaseNonce = "increaseNonce",
    and = "and",
    or = "or",
    eq = "eq",
    lt = "lt",
    gt = "gt",
    timestampBelow = "timestampBelow",
    timestampBelowAndNonceEquals = "timestampBelowAndNonceEquals",
    nonceEquals = "nonceEquals",
    remaining = "remaining",
    transferFrom = "transferFrom",
    checkPredicate = "checkPredicate",
    remainingsRaw = "remainingsRaw",
    simulate = "simulate",
    DOMAIN_SEPARATOR = "DOMAIN_SEPARATOR"
}
