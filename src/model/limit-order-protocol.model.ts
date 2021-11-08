import {EIP712Object} from './eip712.model';
import {LimitOrderPredicateCallData} from '../limit-order-predicate.builder';

export enum ChainId {
    etherumMainnet = 1,
    binanceMainnet = 56,
    polygonMainnet = 137,
}

export type LimitOrderSignature = string;

export type LimitOrderHash = string;

// RFQOrderData.expiresInTimestamp | RFQOrderData.id
export type RFQOrderInfo = string;

export interface LimitOrderData {
    makerAddress: string;
    receiver?: string; // Optional, by default = ZERO_ADDRESS
    takerAddress?: string; // Optional, by default = ZERO_ADDRESS
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    predicate?: LimitOrderPredicateCallData;
    permit?: string;
    interaction?: string;
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

export interface LimitOrder extends EIP712Object {
    salt: string;
    makerAsset: string;
    takerAsset: string;
    maker: string;
    receiver: string;
    allowedSender: string;
    makingAmount: string;
    takingAmount: string;
    makerAssetData: string;
    takerAssetData: string;
    getMakerAmount: string;
    getTakerAmount: string;
    predicate: string;
    permit: string;
    interaction: string;
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
