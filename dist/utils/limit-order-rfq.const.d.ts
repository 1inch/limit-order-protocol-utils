import { PromptObject } from 'prompts';
import { ChainId } from '../model/limit-order-protocol.model';
export declare const operationSchema: PromptObject[];
export declare const createOrderSchema: PromptObject[];
export declare const fillOrderSchema: PromptObject[];
export declare const cancelOrderSchema: PromptObject[];
export declare const rpcUrls: {
    [key in ChainId]: string;
};
export declare const contractAddresses: {
    [key in ChainId]: string;
};
export declare const explorersUrls: {
    [key in ChainId]: string;
};
