import {EIP712Object} from './eip712.model';
import {LimitOrderPredicateCallData} from '../limit-order-predicate.builder';

export enum ChainId {
    etherumMainnet = 1,
    binanceMainnet = 56,
    polygonMainnet = 137,
}

export type LimitOrderSignature = string;

export type LimitOrderHash = string;

// LimitOrderRFQData.expiresInTimestampMs | LimitOrderRFQData.id
export type LimitOrderRFQInfo = string;

export interface LimitOrderData {
    makerAddress: string;
    takerAddress?: string; // Optional, by default = ZERO_ADDRESS
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    predicate?: LimitOrderPredicateCallData;
    permit?: string;
    interaction?: string;
}

export interface LimitOrderRFQData {
    // Index number of RFQ limit order. Example: 1
    id: number;
    // Timestamp when the RFQ limit order will expire (milliseconds). Example: 1623076024366
    expiresInTimestampMs: number;
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    makerAddress: string;
    takerAddress?: string; // Optional, by default = ZERO_ADDRESS
}

export interface LimitOrder extends EIP712Object {
    salt: string;
    makerAsset: string;
    takerAsset: string;
    makerAssetData: string;
    takerAssetData: string;
    getMakerAmount: string;
    getTakerAmount: string;
    predicate: string;
    permit: string;
    interaction: string;
}

export interface LimitOrderRFQ extends EIP712Object {
    info: LimitOrderRFQInfo;
    makerAsset: string;
    takerAsset: string;
    makerAssetData: string;
    takerAssetData: string;
}

export enum LimitOrderProtocolMethods {
    getMakerAmount = 'getMakerAmount',
    getTakerAmount = 'getTakerAmount',
    fillOrder = 'fillOrder',
    fillOrderRFQ = 'fillOrderRFQ',
    cancelOrder = 'cancelOrder',
    cancelOrderRFQ = 'cancelOrderRFQ',
    nonce = 'nonce',
    advanceNonce = 'advanceNonce',
    increaseNonce = 'increaseNonce',
    and = 'and',
    or = 'or',
    eq = 'eq',
    lt = 'lt',
    gt = 'gt',
    timestampBelow = 'timestampBelow',
    nonceEquals = 'nonceEquals',
    remaining = 'remaining',
    transferFrom = 'transferFrom',
    checkPredicate = 'checkPredicate',
    remainingsRaw = 'remainingsRaw',
    simulateCalls = 'simulateCalls',
    DOMAIN_SEPARATOR = 'DOMAIN_SEPARATOR',
}
