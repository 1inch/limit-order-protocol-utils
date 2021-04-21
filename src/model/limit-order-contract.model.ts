import {EIP712Object} from './eip712.model';

export enum ChainId {
    etherumMainnet = 1,
    binanceMainnet = 56
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
    predicate?: string;
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
    nonces = 'nonces',
    advanceNonce = 'advanceNonce',
    and = 'and',
    timestampBelow = 'timestampBelow',
    nonceEquals = 'nonceEquals',
    remaining = 'remaining',
    transferFrom = 'transferFrom',
    remainingsRaw = 'remainingsRaw'
}
