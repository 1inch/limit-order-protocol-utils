import {LimitOrderPredicateCallData} from "../limit-order-predicate.builder";

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
    zkSyncEraMainnet = 324,
    baseMainnet = 8453,
}

export type LimitOrderSignature = string;

export type LimitOrderHash = string;

// RFQOrderData.expiresInTimestamp | RFQOrderData.id

export interface LimitOrderData {
    maker: Address,
    receiver?: Address,
    makerAsset: Address,
    takerAsset: Address,
    makingAmount: string,
    takingAmount: string,
    makerTraits?: bigint | string,
}

export type LimitOrderDataLegacy = {
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
};

export type ExtensionParamsWithCustomData = Partial<ExtensionParams> & {
    customData?: string;
}

export interface ExtensionParams {
    makerAssetSuffix: string;
    takerAssetSuffix: string;
    makingAmountGetter: string;
    takingAmountGetter: string;
    predicate: string;
    permit: string;
    preInteraction: string;
    postInteraction: string;
}

export type Address = string;

export type MakerTraits = string;

/**
 * Compatible with EIP712Object
 */
export type LimitOrder = {
    salt: string;
    maker: Address; // maker address
    receiver: Address;
    makerAsset: Address; // maker asset address
    takerAsset: Address; // taker asset address
    makingAmount: string;
    takingAmount: string;
    makerTraits: MakerTraits;
}

export type LimitOrderWithExtension = {
    order: LimitOrder;
    extension: string;
}

/**
 * Compatible with EIP712Object
 */
export type LimitOrderLegacy = {
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

/**
 * uint40
 */
export type Nonce = number | bigint;

/**
 * seconds unit40
 */
export type PredicateTimestamp = number | bigint;

export const InteractionsFieldsV3 = {
    makerAssetData: 0,
    takerAssetData: 1,
    getMakingAmount: 2,
    getTakingAmount: 3,
    predicate: 4,
    permit: 5,
    preInteraction: 6,
    postInteraction: 7,
// cuz enum has numeric keys also
} as const;

export const InteractionsFields = {
    makerAssetSuffix: 0,
    takerAssetSuffix: 1,
    makingAmountGetter: 2,
    takingAmountGetter: 3,
    predicate: 4,
    permit: 5,
    preInteraction: 6,
    postInteraction: 7
} as const;

export interface ParsedMakerTraits {
    allowedSender: Address;
    shouldCheckEpoch: boolean;
    allowPartialFill: boolean;
    allowPriceImprovement: boolean;
    allowMultipleFills: boolean;
    usePermit2: boolean;
    unwrapWeth: boolean;
    expiry: number;
    nonce: number;
    series: number;
}

export type InteractionName = keyof typeof InteractionsFields;

export type Interactions = {
    [key in InteractionName]: string;
};

export interface UnpackedExtension {
    interactions: Interactions;
    customData: string;
}

export type InteractionV3Name = keyof typeof InteractionsFieldsV3;

export type InteractionsV3 = {
    [key in InteractionV3Name]: string;
};

export type AllInteractions = typeof InteractionsFields | typeof InteractionsFieldsV3;


export enum LimitOrderProtocolMethodsV3 {
    cancelOrder = 'cancelOrder',
    timestampBelow = 'timestampBelow',
    timestampBelowAndNonceEquals = 'timestampBelowAndNonceEquals',
    checkPredicate = 'checkPredicate',
    increaseNonce = 'increaseNonce',
    nonce = 'nonce',
    advanceNonce = 'advanceNonce',
    and = 'and',
    or = 'or',
    eq = 'eq',
    lt = 'lt',
    gt = 'gt',
    nonceEquals = 'nonceEquals',
    arbitraryStaticCall = 'arbitraryStaticCall',
}

export enum LimitOrderProtocolMethods {
    getMakingAmount = 'getMakingAmount',
    getTakingAmount = 'getTakingAmount',
    arbitraryStaticCall = 'arbitraryStaticCall',
    fillOrder = 'fillOrder',
    fillOrderExt = 'fillOrderExt',
    fillOrderToWithPermit = 'fillOrderToWithPermit',
    cancelOrder = 'cancelOrder',
    increaseEpoch = 'increaseEpoch',
    remainingInvalidatorForOrder = 'remainingInvalidatorForOrder',
    epoch = 'epoch',
    nonce = 'nonce',
    advanceNonce = 'advanceNonce',
    increaseNonce = 'increaseNonce',
    and = 'and',
    or = 'or',
    eq = 'eq',
    lt = 'lt',
    gt = 'gt',
    nonceEquals = 'nonceEquals',
    remaining = 'remaining',
    transferFrom = 'transferFrom',
    checkPredicate = 'checkPredicate',
    remainingsRaw = 'remainingsRaw',
    simulate = 'simulate',
}
