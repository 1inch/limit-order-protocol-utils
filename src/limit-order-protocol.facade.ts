import {
    LIMIT_ORDER_PROTOCOL_ABI,
    CALL_RESULTS_PREFIX,
    ZX,
} from './limit-order-protocol.const';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature,
    RFQOrderInfo,
    RFQOrder,
} from './model/limit-order-protocol.model';
import {ProviderConnector} from './connector/provider.connector';
import {BigNumber} from '@ethersproject/bignumber';
import {getRPCCode} from './utils/get-rpc-code';
import {parseSimulateResult} from './utils/limit-order.utils';

// todo move into model
export interface FillOrderParams {
    order: LimitOrder;
    signature: LimitOrderSignature;
    interaction?: string;
    makingAmount: string;
    takingAmount: string;
    skipPermitAndThresholdAmount: string;
}

export type FillLimitOrderWithPermitParams = FillOrderParams & {
    targetAddress: string;
    permit: string;
}

export class LimitOrderProtocolFacade {
    constructor(
        public readonly contractAddress: string,
        public readonly providerConnector: ProviderConnector
    ) {}

    fillLimitOrder(params: FillOrderParams): string {
        const {
            order,
            interaction = ZX,
            signature,
            makingAmount,
            takingAmount,
            skipPermitAndThresholdAmount,
        } = params;

        return this.getContractCallData(LimitOrderProtocolMethods.fillOrder, [
            order,
            signature,
            interaction,
            makingAmount,
            takingAmount,
            skipPermitAndThresholdAmount,
        ]);
    }

    // todo
    // eslint-disable-next-line max-lines-per-function
    fillOrderToWithPermit(params: FillLimitOrderWithPermitParams): string {
        const {
            order,
            signature,
            makingAmount,
            takingAmount,
            interaction = ZX,
            skipPermitAndThresholdAmount,
            targetAddress,
            permit,
        } = params;

        return this.getContractCallData(
            LimitOrderProtocolMethods.fillOrderToWithPermit,
            [
                order,
                signature,
                interaction,
                makingAmount,
                takingAmount,
                skipPermitAndThresholdAmount,
                targetAddress,
                permit
            ],
        );
    }

    fillRFQOrder(
        order: RFQOrder,
        signature: LimitOrderSignature,
        makerAmount: string,
        takerAmount: string
    ): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.fillOrderRFQ,
            [order, signature, makerAmount, takerAmount]
        );
    }

    cancelLimitOrder(order: LimitOrder): string {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            order,
        ]);
    }

    cancelRFQOrder(orderInfo: RFQOrderInfo): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.cancelOrderRFQ,
            [orderInfo]
        );
    }

    nonce(makerAddress: string): Promise<number> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.nonce,
            [makerAddress]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((nonce) => BigNumber.from(nonce).toNumber());
    }

    advanceNonce(count: number): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.advanceNonce,
            [count]
        );
    }

    increaseNonce(): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.increaseNonce
        );
    }

    checkPredicate(order: LimitOrder): Promise<boolean> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.checkPredicate,
            [order]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .catch((error) => {
                console.error(error);

                return false;
            })
            .then((result) => {
                try {
                    return BigNumber.from(result).toNumber() === 1;
                } catch (e) {
                    console.error(e);

                    return false;
                }
            });
    }

    remaining(orderHash: LimitOrderHash): Promise<BigNumber> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.remaining,
            [orderHash]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                const response = this.parseRemainingResponse(result);

                if (response !== null) {
                    return response;
                }

                // Parse error
                const parsed = this.parseContractResponse(result);

                return Promise.reject(parsed);
            });
    }

    // eslint-disable-next-line max-lines-per-function
    simulate(targetAddress: string, data: unknown): Promise<{ success: boolean, result: string }> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.simulate,
            [targetAddress, data]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            // todo is it possible ?
            .then((result) => {
                const parsedResult = parseSimulateResult(result);
                if (parsedResult) {
                    return parsedResult;
                }

                throw result;
            })
            .catch((result) => {
                const parsedResult = parseSimulateResult(result);
                if (parsedResult) {
                    return parsedResult;
                }

                throw result;
            });
    }

    domainSeparator(): Promise<string> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.DOMAIN_SEPARATOR
        );

        return this.providerConnector.ethCall(this.contractAddress, callData);
    }

    getContractCallData(
        methodName: LimitOrderProtocolMethods,
        methodParams: unknown[] = []
    ): string {
        return this.providerConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }

    parseRemainingResponse(response: string): BigNumber | null {
        if (response.length === 66) {
            return BigNumber.from(response);
        }

        return null;
    }

    parseSimulateTransferResponse(response: string): boolean | null {
        const parsed = this.parseContractResponse(response);

        if (parsed.startsWith(CALL_RESULTS_PREFIX)) {
            const data = parsed.replace(CALL_RESULTS_PREFIX, '');

            return !data.includes('0');
        }

        return null;
    }

    parseSimulateTransferError(error: Error | string): boolean | null {
        const message = this.stringifyError(error);
        const isCorrectCode = this.isMsgContainsCorrectCode(message);
        if (isCorrectCode !== null) {
            return isCorrectCode;
        }

        try {
            const code = getRPCCode(message);
            return code ? this.isMsgContainsCorrectCode(code) : null;
        } catch (e) {
            return null;
        }
    }

    parseContractResponse(response: string): string {
        // Aurora network wraps revert message into Revert()
        const matched = response.match(/Revert\(([^)]+)\)/);
        const message = matched && matched[1] ? matched[1] : response;

        return this.providerConnector.decodeABIParameter<string>(
            'string',
            ZX + message.slice(10)
        );
    }

    private isMsgContainsCorrectCode(message: string): boolean | null {
        const regex = new RegExp('(' + CALL_RESULTS_PREFIX + '\\d+)');
        const matched = message.match(regex);

        if (matched) {
            return !matched[0].includes('0');
        } else {
            try {
                const matchParsed = this.parseContractResponse(message).match(
                    regex
                );

                if (matchParsed) {
                    return !matchParsed[0].includes('0');
                }
            } catch (e) {
                console.error(e);
            }
        }

        return null;
    }

    private stringifyError(error: Error | string | unknown): string {
        if (typeof error === 'string') {
            return error;
        }

        if (error instanceof Error) {
            return error.toString();
        }

        return JSON.stringify(error);
    }
}
