import {
    LIMIT_ORDER_PROTOCOL_ABI,
    ZX
} from './limit-order-protocol.const';
import {
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderHash,
    LimitOrderSignature
} from './model/limit-order-protocol.model';
import {ProviderConnector} from './provider-connector';
import {BigNumber} from '@ethersproject/bignumber';

export class LimitOrderProtocolFacade {
    constructor(
        private readonly contractAddress: string,
        private readonly providerConnector: ProviderConnector,
    ) {
    }

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
            takerAmount
        ]);
    }

    cancelOrder(order: LimitOrder): string {
        return this.getContractCallData(LimitOrderProtocolMethods.cancelOrder, [
            order
        ]);
    }

    nonces(makerAddress: string): Promise<number> {
        const callData = this.getContractCallData(LimitOrderProtocolMethods.nonces, [
            makerAddress
        ]);

        return this.providerConnector.ethCall(this.contractAddress, callData)
            .then(nonce => BigNumber.from(nonce).toNumber());
    }

    advanceNonce(): string {
        return this.getContractCallData(LimitOrderProtocolMethods.advanceNonce);
    }

    andPredicate(predicates: string[]): string {
        return this.getContractCallData(LimitOrderProtocolMethods.and, [
            predicates.map(() => this.contractAddress),
            predicates
        ]);
    }

    timestampBelow(timestamp: number): string {
        return this.getContractCallData(LimitOrderProtocolMethods.timestampBelow, [
            timestamp
        ]);
    }

    nonceEquals(makerAddress: string, makerNonce: number): string {
        return this.getContractCallData(LimitOrderProtocolMethods.nonceEquals, [
            makerAddress,
            makerNonce
        ]);
    }

    remaining(hash: LimitOrderHash): Promise<BigNumber | string> {
        const callData = this.getContractCallData(LimitOrderProtocolMethods.remaining, [
            hash
        ]);

        return this.providerConnector.ethCall(this.contractAddress, callData).then(result => {
            if (result.length === 66) {
                return BigNumber.from(result);
            }

            // Parse error
            const parsed = this.providerConnector.decodeABIParameter('string', ZX + result.slice(10));

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

    private getContractCallData(methodName: LimitOrderProtocolMethods, methodParams: any[] = []): string {
        return this.providerConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }
}
