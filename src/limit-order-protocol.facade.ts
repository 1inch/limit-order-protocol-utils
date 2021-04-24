import {LIMIT_ORDER_PROTOCOL_ABI, ZX} from './limit-order-protocol.const';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature,
} from './model/limit-order-protocol.model';
import {ProviderConnector} from './connector/provider.connector';
import {BigNumber} from '@ethersproject/bignumber';

/**
 * TODO: create PredicateBuilder:
 * const predicate = new PredicateBuilder()
 * .timestampBelow(600)
 * .nonceEquals(1)
 * .build();
 */
export class LimitOrderProtocolFacade {
    constructor(
        private readonly contractAddress: string,
        private readonly providerConnector: ProviderConnector
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

    remaining(hash: LimitOrderHash): Promise<BigNumber | string> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethods.remaining,
            [hash]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((result) => {
                if (result.length === 66) {
                    return BigNumber.from(result);
                }

                // Parse error
                const parsed = this.providerConnector.decodeABIParameter(
                    'string',
                    ZX + result.slice(10)
                );

                return Promise.reject(parsed);
            });
    }

    remainingsRaw(hashes: LimitOrderHash[]): Promise<string[]> {
        return this.providerConnector.contractCall<string[]>(
            LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            LimitOrderProtocolMethods.remainingsRaw,
            [hashes],
            'latest'
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
