import {LIMIT_ORDER_PROTOCOL_ABI, ZX} from './limit-order-protocol.const';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature,
} from './model/limit-order-protocol.model';
import {ProviderConnector} from './connector/provider.connector';
import {BigNumber} from '@ethersproject/bignumber';

const SIMULATE_TRANSFER_PREFIX = 'TRANSFERS_SUCCESSFUL_';

/**
 * TODO: create PredicateBuilder:
 * const predicate = new PredicateBuilder()
 * .timestampBelow(600)
 * .nonceEquals(1)
 * .build();
 */
export class LimitOrderProtocolFacade {
    constructor(
        public readonly contractAddress: string,
        public readonly providerConnector: ProviderConnector
    ) {}

    fillOrder(
        order: LimitOrder,
        signature: LimitOrderSignature,
        makerAmount: string,
        takerAmount: string
    ): string {
        return this.getContractCallData(LimitOrderProtocolMethods.fillOrder, [
            order,
            signature,
            makerAmount,
            takerAmount,
        ]);
    }

    cancelOrder(order: LimitOrder): string {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            order,
        ]);
    }

    nonces(makerAddress: string): Promise<number> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.nonces,
            [makerAddress]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((nonce) => BigNumber.from(nonce).toNumber());
    }

    advanceNonce(): string {
        return this.getContractCallData(LimitOrderProtocolMethods.advanceNonce);
    }

    andPredicate(predicates: string[]): string {
        return this.getContractCallData(LimitOrderProtocolMethods.and, [
            predicates.map(() => this.contractAddress),
            predicates,
        ]);
    }

    timestampBelow(timestamp: number): string {
        return this.getContractCallData(
            LimitOrderProtocolMethods.timestampBelow,
            [ZX + timestamp.toString(16)]
        );
    }

    nonceEquals(makerAddress: string, makerNonce: number): string {
        return this.getContractCallData(LimitOrderProtocolMethods.nonceEquals, [
            makerAddress,
            makerNonce,
        ]);
    }

    checkPredicate(order: LimitOrder): Promise<boolean> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.checkPredicate,
            [order]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                try {
                    return BigNumber.from(result).toNumber() === 1;
                } catch (e) {
                    console.error(e);

                    return false;
                }
            });
    }

    remaining(hash: LimitOrderHash): Promise<BigNumber> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.remaining,
            [hash]
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

    parseRemainingResponse(response: string): BigNumber | null {
        if (response.length === 66) {
            return BigNumber.from(response);
        }

        return null;
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

    parseSimulateTransferResponse(response: string): boolean | null {
        const parsed = this.parseContractResponse(response);

        if (parsed.startsWith(SIMULATE_TRANSFER_PREFIX)) {
            const data = parsed.replace(SIMULATE_TRANSFER_PREFIX, '');

            return !data.includes('0');
        }

        return null;
    }

    parseSimulateTransferError(error: Error | string): boolean | null {
        const message = typeof error === 'string' ? error : error.message;

        if (message.includes(SIMULATE_TRANSFER_PREFIX)) {
            return !message.includes('0');
        }

        return null;
    }

    parseContractResponse(response: string): string {
        return this.providerConnector.decodeABIParameter<string>(
            'string',
            ZX + response.slice(10)
        );
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
}
