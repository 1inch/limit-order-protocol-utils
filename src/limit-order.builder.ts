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
    LimitOrderProtocolMethods,
    LimitOrderData,
    LimitOrderHash,
    LimitOrderSignature
} from './model/limit-order-protocol.model';
import {EIP712TypedData} from './model/eip712.model';
import {TypedDataUtils} from 'eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';

export class LimitOrderBuilder {
    constructor(
        private readonly contractAddress: string,
        private readonly chainId: ChainId,
        private readonly providerConnector: ProviderConnector,
    ) {
    }

    buildOrderSignature(walletAddress: string, typedData: EIP712TypedData): Promise<LimitOrderSignature> {
        return this.providerConnector.signTypedData(walletAddress, typedData);
    }

    buildOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
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
            getMakerAmount: this.getAmountData(LimitOrderProtocolMethods.getMakerAmount, makerAmount, takerAmount),
            getTakerAmount: this.getAmountData(LimitOrderProtocolMethods.getTakerAmount, makerAmount, takerAmount),
            predicate,
            permit,
            interaction
        };
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
        methodName: LimitOrderProtocolMethods,
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

    private getContractCallData(methodName: LimitOrderProtocolMethods, methodParams: any[] = []): string {
        return this.providerConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }
}
