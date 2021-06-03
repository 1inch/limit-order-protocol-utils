import {EIP712Object} from './eip712.model';
import {LimitOrderPredicateCallData} from '../limit-order-predicate.builder';

export enum ChainId {
    etherumMainnet = 1,
    binanceMainnet = 56,
}

export type LimitOrderSignature = string;

export type LimitOrderHash = string;

export interface LimitOrderData {
    makerAddress: string;
    takerAddress?: string; //optional, by default = ZERO_ADDRESS
    makerAssetAddress: string;
    takerAssetAddress: string;
    makerAmount: string;
    takerAmount: string;
    predicate?: LimitOrderPredicateCallData;
    permit?: string;
    interaction?: string;
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

export enum LimitOrderProtocolMethods {
    getMakerAmount = 'getMakerAmount',
    getTakerAmount = 'getTakerAmount',
    fillOrder = 'fillOrder',
    cancelOrder = 'cancelOrder',
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
