import {EIP712Object} from './eip712.model';
import {LimitOrderPredicateCallData} from '../limit-order-predicate.builder';

export enum ChainId {
    etherumMainnet = 1,
    binanceMainnet = 56,
    polygonMainnet = 137,
    optimismMainnet = 10,
    arbitrumMainnet = 42161,
    gnosisMainnet = 100,
    avalancheMainnet = 43114,
    fantomMainnet = 250,
    auroraMainnet = 1313161554,
    klaytnMainnet = 8217,
}

export type LimitOrderSignature = string;

export type LimitOrderHash = string;

// RFQOrderData.expiresInTimestamp | RFQOrderData.id
export type RFQOrderInfo = string;

export interface LimitOrderData {
    makerAddress: string;
    receiver?: string; // Optional, by default = ZERO_ADDRESS
    allowedSender?: string; // Optional, by default = ZERO_ADDRESS
    makerAssetAddress: string;
    takerAssetAddress: string;
    makingAmount: string;
    takingAmount: string;
    predicate?: LimitOrderPredicateCallData;
    permit?: string;
    getMakingAmount?: string;
    getTakingAmount?: string;
    preInteraction?: string;
    postInteraction?: string;
    salt?: string;
}

export interface RFQOrderData {
    // Index number of RFQ limit order. Example: 1
    id: number;
    wrapEth?: boolean;
    // Timestamp when the RFQ limit order will expire (seconds). Example: 1623166102
    expiresInTimestamp: number;
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    makerAddress: string;
    takerAddress?: string; // Optional, by default = ZERO_ADDRESS
}

/**
 * Compatible with EIP712Object
 */
export type LimitOrder = {
    salt: string;
    makerAsset: string; // maker asset address
    takerAsset: string; // taker asset address
    maker: string; // maker address
    receiver: string;
    allowedSender: string;
    makingAmount: string;
    takingAmount: string;
    offsets: string;
    interactions: string;
} & LimitOrderInteractions

/**
 * Partial from LimitOrder
 */
export type LimitOrderInteractions = {
    offsets: string;
    interactions: string;
}

export type Nonce = number | bigint;

export interface RFQOrder extends EIP712Object {
    info: RFQOrderInfo;
    makerAsset: string;
    takerAsset: string;
    maker: string;
    allowedSender: string;
    makingAmount: string;
    takingAmount: string;
}

export enum LimitOrderProtocolMethods {
    getMakingAmount = 'getMakingAmount',
    getTakingAmount = 'getTakingAmount',
    arbitraryStaticCall = 'arbitraryStaticCall',
    fillOrder = 'fillOrder',
    fillOrderToWithPermit = 'fillOrderToWithPermit',
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
    timestampBelowAndNonceEquals = 'timestampBelowAndNonceEquals',
    nonceEquals = 'nonceEquals',
    remaining = 'remaining',
    transferFrom = 'transferFrom',
    checkPredicate = 'checkPredicate',
    remainingsRaw = 'remainingsRaw',
    simulate = 'simulate',
}
