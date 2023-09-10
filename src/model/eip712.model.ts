export const ORDER_STRUCTURE = [
    { name: 'salt', type: 'uint256' },
    { name: 'maker', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'makerAsset', type: 'address' },
    { name: 'takerAsset', type: 'address' },
    { name: 'makingAmount', type: 'uint256' },
    { name: 'takingAmount', type: 'uint256' },
    { name: 'makerTraits', type: 'uint256' },
];

export interface EIP712TypedData {
    types: EIP712Types & { EIP712Domain: EIP712Parameter[] };
    domain: EIP712Object;
    message: EIP712Object;
    primaryType: string;
}

export interface EIP712Types {
    [key: string]: EIP712Parameter[];
}

export interface EIP712Parameter {
    name: string;
    type: string;
}

export declare type EIP712ObjectValue = string | number | EIP712Object;

export interface EIP712Object {
    [key: string]: EIP712ObjectValue;
}

export interface MessageTypes {
    [additionalProperties: string]: MessageTypeProperty[];
    EIP712Domain: MessageTypeProperty[];
}

export interface MessageTypeProperty {
    name: string;
    type: string;
}
