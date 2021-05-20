import {
    LIMIT_ORDER_PROTOCOL_ABI,
    SIMULATE_TRANSFER_PREFIX,
    ZX,
} from './limit-order-protocol.const';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature,
} from './model/limit-order-protocol.model';
import {ProviderConnector} from './connector/provider.connector';
import {BigNumber} from '@ethersproject/bignumber';

export class LimitOrderProtocolFacade {
    constructor(
        public readonly contractAddress: string,
        public readonly providerConnector: ProviderConnector
    ) {}

    fillOrder(
        order: LimitOrder,
        signature: LimitOrderSignature,
        makerAmount: string,
        takerAmount: string,
        thresholdAmount: string
    ): string {
        return this.getContractCallData(LimitOrderProtocolMethods.fillOrder, [
            order,
            signature,
            makerAmount,
            takerAmount,
            thresholdAmount,
        ]);
    }

    cancelOrder(order: LimitOrder): string {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            order,
        ]);
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

    simulateTransferFroms(tokens: string[], data: unknown[]): Promise<boolean> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.simulateTransferFroms,
            [tokens, data]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                const parsed = this.parseSimulateTransferResponse(result);

                if (parsed !== null) return parsed;

                return Promise.reject(result);
            })
            .catch((error) => {
                const parsed = this.parseSimulateTransferError(error);

                if (parsed !== null) return parsed;

                return Promise.reject(error);
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

        if (parsed.startsWith(SIMULATE_TRANSFER_PREFIX)) {
            const data = parsed.replace(SIMULATE_TRANSFER_PREFIX, '');

            return !data.includes('0');
        }

        return null;
    }

    parseSimulateTransferError(error: Error | string): boolean | null {
        const message =
            typeof error === 'string'
                ? error
                : JSON.stringify(error.message || error);
        const regex = new RegExp('(' + SIMULATE_TRANSFER_PREFIX + '\\d+)');
        const match = message.match(regex);

        if (match) {
            return !match[0].includes('0');
        }

        return null;
    }

    parseContractResponse(response: string): string {
        return this.providerConnector.decodeABIParameter<string>(
            'string',
            ZX + response.slice(10)
        );
    }
}
