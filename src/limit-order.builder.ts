import {
    EIP712_DOMAIN,
    ORDER_STRUCTURE,
    PROTOCOL_VERSION,
    ZERO_ADDRESS,
    PROTOCOL_NAME,
    LIMIT_ORDER_PROTOCOL_ABI,
    ZX,
    ORDER_RFQ_STRUCTURE,
} from './limit-order-protocol.const';
import {
    ChainId,
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderData,
    LimitOrderHash,
    LimitOrderSignature,
    LimitOrderRFQ,
    LimitOrderRFQData,
} from './model/limit-order-protocol.model';
import {EIP712TypedData, MessageTypes} from './model/eip712.model';
import {TypedDataUtils, TypedMessage} from 'eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';
import {Erc20Facade} from './erc20.facade';

export function generateOrderSalt(): string {
    return Math.round(Math.random() * Date.now()) + '';
}

export function generateRFQOrderInfo(
    id: number,
    expiresInTimestampMs: number
): string {
    return ((BigInt(expiresInTimestampMs) << BigInt(64)) | BigInt(id)).toString(
        10
    );
}

export class LimitOrderBuilder {
    private readonly erc20Facade: Erc20Facade;

    constructor(
        private readonly contractAddress: string,
        private readonly chainId: ChainId,
        private readonly providerConnector: ProviderConnector,
        private readonly generateSalt = generateOrderSalt
    ) {
        this.erc20Facade = new Erc20Facade(this.providerConnector);
    }

    buildOrderSignature(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<LimitOrderSignature> {
        const dataHash = TypedDataUtils.hashStruct(
            typedData.primaryType,
            typedData.message,
            typedData.types,
            true
        ).toString('hex');

        return this.providerConnector.signTypedData(
            walletAddress,
            typedData,
            dataHash
        );
    }

    buildOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
        const message = orderTypedData as TypedMessage<MessageTypes>;

        return ZX + TypedDataUtils.sign(message).toString('hex');
    }

    buildOrderTypedData(order: LimitOrder): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE,
            },
            domain: {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }

    buildOrderRFQTypedData(order: LimitOrderRFQ): EIP712TypedData {
        return {
            primaryType: 'OrderRFQ',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                OrderRFQ: ORDER_RFQ_STRUCTURE,
            },
            domain: {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }

    /* eslint-disable max-lines-per-function */
    buildOrderRFQ({
        id,
        expiresInTimestampMs,
        makerAssetAddress,
        takerAssetAddress,
        makerAddress,
        takerAddress = ZERO_ADDRESS,
        makerAmount,
        takerAmount,
    }: LimitOrderRFQData): LimitOrderRFQ {
        return {
            info: generateRFQOrderInfo(id, expiresInTimestampMs),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            makerAssetData: this.erc20Facade.transferFrom(
                null,
                makerAddress,
                takerAddress,
                makerAmount
            ),
            takerAssetData: this.erc20Facade.transferFrom(
                null,
                takerAddress,
                makerAddress,
                takerAmount
            ),
        };
    }
    /* eslint-enable max-lines-per-function */

    /* eslint-disable max-lines-per-function */
    buildOrder({
        makerAssetAddress,
        takerAssetAddress,
        makerAddress,
        takerAddress = ZERO_ADDRESS,
        makerAmount,
        takerAmount,
        predicate = ZX,
        permit = ZX,
        interaction = ZX,
    }: LimitOrderData): LimitOrder {
        return {
            salt: this.generateSalt(),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            makerAssetData: this.erc20Facade.transferFrom(
                null,
                makerAddress,
                takerAddress,
                makerAmount
            ),
            takerAssetData: this.erc20Facade.transferFrom(
                null,
                takerAddress,
                makerAddress,
                takerAmount
            ),
            getMakerAmount: this.getAmountData(
                LimitOrderProtocolMethods.getMakerAmount,
                makerAmount,
                takerAmount
            ),
            getTakerAmount: this.getAmountData(
                LimitOrderProtocolMethods.getTakerAmount,
                makerAmount,
                takerAmount
            ),
            predicate,
            permit,
            interaction,
        };
    }
    /* eslint-enable max-lines-per-function */

    // Get nonce from contract (nonce method) and put it to predicate on order creating
    private getAmountData(
        methodName: LimitOrderProtocolMethods,
        makerAmount: string,
        takerAmount: string,
        swapTakerAmount = '0'
    ): string {
        return this.getContractCallData(methodName, [
            makerAmount,
            takerAmount,
            swapTakerAmount,
        ]).substr(0, 2 + 68 * 2);
    }

    private getContractCallData(
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
