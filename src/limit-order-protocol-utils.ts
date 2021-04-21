import {
    EIP712_DOMAIN,
    ORDER_STRUCTURE,
    PROTOCOL_VERSION,
    ZERO_ADDRESS,
    PROTOCOL_NAME,
    LIMIT_ORDER_PROTOCOL_ABI,
    ERC20_ABI, ZX
} from './limit-order-protocol.const';
import {
    ChainId,
    LimitOrder,
    LimitOrderContractMethods, LimitOrderData,
    LimitOrderHash,
    LimitOrderSignature
} from './model/limit-order-contract.model';
import {EIP712TypedData} from './model/eip712.model';
import {TypedDataUtils} from 'eth-sig-util';
import {ProviderConnector} from './provider-connector';
import {BigNumber} from '@ethersproject/bignumber';

export class LimitOrderProtocolUtils {
    constructor(
        private readonly contractAddress: string,
        private readonly chainId: ChainId,
        private readonly providerConnector: ProviderConnector,
    ) {
    }

    getOrderSignature(walletAddress: string, typedData: EIP712TypedData): Promise<LimitOrderSignature> {
        return this.providerConnector.signTypedData(walletAddress, typedData);
    }

    getOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
        return ZX + TypedDataUtils.sign(orderTypedData as any).toString('hex');
    }

    buildOrderTypedData(order: LimitOrder): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE
            },
            domain: {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress
            },
            message: order,
        };
    }

    buildOrder(data: LimitOrderData): LimitOrder {
        const {
            makerAssetAddress,
            takerAssetAddress,
            makerAddress,
            takerAddress = ZERO_ADDRESS,
            makerAmount,
            takerAmount,
            predicate = ZX,
            permit = ZX,
            interaction = ZX
        } = data;

        return {
            salt: this.generateSalt(),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            makerAssetData: this.transferFrom(makerAssetAddress, makerAddress, takerAddress, makerAmount),
            takerAssetData: this.transferFrom(makerAssetAddress, takerAddress, makerAddress, takerAmount),
            getMakerAmount: this.getAmountData(LimitOrderContractMethods.getMakerAmount, makerAmount, takerAmount),
            getTakerAmount: this.getAmountData(LimitOrderContractMethods.getTakerAmount, makerAmount, takerAmount),
            predicate,
            permit,
            interaction
        };
    }

    fillOrder(
        order: LimitOrder,
        signature: LimitOrderSignature,
        makerAmount: string,
        takerAmount: string
    ): string {
        return this.getContractCallData(LimitOrderContractMethods.fillOrder, [
            order,
            signature,
            makerAmount,
            takerAmount
        ]);
    }

    cancelOrder(order: LimitOrder): string {
        return this.getContractCallData(LimitOrderContractMethods.cancelOrder, [
            order
        ]);
    }

    nonces(makerAddress: string): Promise<number> {
        const callData = this.getContractCallData(LimitOrderContractMethods.nonces, [
            makerAddress
        ]);

        return this.providerConnector.ethCall(this.contractAddress, callData)
            .then(nonce => BigNumber.from(nonce).toNumber());
    }

    advanceNonce(): string {
        return this.getContractCallData(LimitOrderContractMethods.advanceNonce);
    }

    andPredicate(predicates: string[]): string {
        return this.getContractCallData(LimitOrderContractMethods.and, [
            predicates.map(() => this.contractAddress),
            predicates
        ]);
    }

    timestampBelow(timestamp: number): string {
        return this.getContractCallData(LimitOrderContractMethods.timestampBelow, [
            timestamp
        ]);
    }

    nonceEquals(makerAddress: string, makerNonce: number): string {
        return this.getContractCallData(LimitOrderContractMethods.nonceEquals, [
            makerAddress,
            makerNonce
        ]);
    }

    remaining(hash: LimitOrderHash): Promise<BigNumber | string> {
        const callData = this.getContractCallData(LimitOrderContractMethods.remaining, [
            hash
        ]);

        return this.providerConnector.ethCall(this.contractAddress, callData)
            .then(result => {
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
            LimitOrderContractMethods.remainingsRaw,
            [hashes],
            'latest'
        );
    }

    private generateSalt(): string {
        return Math.round(Math.random() * Date.now()) + '';
    }

    private transferFrom(
        makerAssetAddress: string,
        fromAddress: string,
        toAddress: string,
        value: string
    ): string {
        return this.providerConnector.contractEncodeABI(
            ERC20_ABI,
            makerAssetAddress,
            'transferFrom',
            [
                fromAddress,
                toAddress,
                value,
            ]
        );
    }

    // Get nonce from contract (nonces method) and put it to predicate on order creating
    private getAmountData(
        methodName: LimitOrderContractMethods,
        makerAmount: string,
        takerAmount: string,
        swapTakerAmount = '0'
    ): string {
        return this.getContractCallData(methodName, [
            makerAmount,
            takerAmount,
            swapTakerAmount
        ]).substr(0, 2 + 68 * 2);
    }

    private getContractCallData(methodName: LimitOrderContractMethods, methodParams: any[] = []): string {
        return this.providerConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }
}
