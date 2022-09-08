#!/usr/bin/env node
import Web3 from 'web3';
import { RFQOrder } from '../model/limit-order-protocol.model';
import { CancelingParams, CreatingParams, FillingParams } from './limit-order-rfq.model';
import { TransactionConfig } from 'web3-core';
export declare function createOrderOperation(isRunningWithArgv: boolean, params?: CreatingParams): Promise<void>;
export declare function fillOrderOperation(isRunningWithArgv: boolean, params?: FillingParams): Promise<void>;
export declare function cancelOrderOperation(isRunningWithArgv: boolean, params?: CancelingParams): Promise<void>;
export declare function createOrder(params: CreatingParams): RFQOrder;
export declare function fillOrder(params: FillingParams, order: RFQOrder): Promise<string>;
export declare function cancelOrder(params: CancelingParams): Promise<string>;
export declare function sendSignedTransaction(web3: Web3, txConfig: TransactionConfig, privateKey: string): Promise<string>;
export declare function gweiToWei(value: number): string;
