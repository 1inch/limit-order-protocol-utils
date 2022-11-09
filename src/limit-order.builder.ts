import {
    EIP712_DOMAIN,
    LIMIT_ORDER_PROTOCOL_ABI,
    ORDER_STRUCTURE,
    PROTOCOL_NAME,
    PROTOCOL_VERSION,
    RFQ_ORDER_STRUCTURE,
    ZERO_ADDRESS,
    ZX,
} from './limit-order-protocol.const';
import {
    ChainId,
    LimitOrder,
    LimitOrderData,
    LimitOrderHash,
    LimitOrderProtocolMethods,
    LimitOrderSignature,
    RFQOrder,
    RFQOrderData,
} from './model/limit-order-protocol.model';
import {EIP712TypedData, MessageTypes} from './model/eip712.model';
import {bufferToHex} from 'ethereumjs-util';
import {SignTypedDataVersion, TypedDataUtils, TypedMessage} from '@metamask/eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';
import { packInteractions } from './helpers';

export function generateOrderSalt(): string {
    return Math.round(Math.random() * Date.now()) + '';
}

export function generateRFQOrderInfo(
    id: number,
    expiresInTimestamp: number,
    wrapEth: boolean
): string {
    const info = (BigInt(expiresInTimestamp) << BigInt(64)) | BigInt(id);

    if (wrapEth) {
        return (info | (BigInt(1) << BigInt(255))).toString(10);
    }

    return info.toString(10);
}

export class LimitOrderBuilder {
    constructor(
        private readonly contractAddress: string,
        private readonly chainId: ChainId | number,
        private readonly providerConnector: ProviderConnector,
        private readonly generateSalt = generateOrderSalt
    ) {}

    buildOrderSignature(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<LimitOrderSignature> {
        const dataHash = TypedDataUtils.hashStruct(
            typedData.primaryType,
            typedData.message,
            typedData.types,
            SignTypedDataVersion.V4
        ).toString('hex');

        return this.providerConnector.signTypedData(
            walletAddress,
            typedData,
            dataHash
        );
    }

    buildLimitOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
        const message = orderTypedData as TypedMessage<MessageTypes>;
        const hash = bufferToHex(TypedDataUtils.eip712Hash(message, SignTypedDataVersion.V4));
        return ZX + hash.substring(2);
    }

    buildLimitOrderTypedData(
        order: LimitOrder,
        domainName = PROTOCOL_NAME
    ): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE,
            },
            domain: {
                name: domainName,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }

    buildRFQOrderTypedData(
        order: RFQOrder,
        domainName = PROTOCOL_NAME
    ): EIP712TypedData {
        return {
            primaryType: 'OrderRFQ',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                OrderRFQ: RFQ_ORDER_STRUCTURE,
            },
            domain: {
                name: domainName,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }

    /* eslint-disable max-lines-per-function */
    buildRFQOrder({
        id,
        wrapEth = false,
        expiresInTimestamp,
        makerAssetAddress,
        takerAssetAddress,
        makerAddress,
        takerAddress = ZERO_ADDRESS,
        makingAmount,
        takingAmount,
    }: RFQOrderData): RFQOrder {
        return {
            info: generateRFQOrderInfo(id, expiresInTimestamp, wrapEth),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            allowedSender: takerAddress,
            makingAmount,
            takingAmount,
        };
    }
    /* eslint-enable max-lines-per-function */

    /* eslint-disable max-lines-per-function */
    /**
     * @param allowedSender formerly `takerAddress` 
     * @returns 
     */
    buildLimitOrder({
        makerAssetAddress,
        takerAssetAddress,
        makerAddress,
        receiver = ZERO_ADDRESS,
        allowedSender = ZERO_ADDRESS,
        makingAmount,
        takingAmount,
        predicate = ZX,
        permit = ZX,
        getMakingAmount = ZX,
        getTakingAmount = ZX,
        preInteraction = ZX,
        postInteraction = ZX,
        salt = this.generateSalt(),
    }: LimitOrderData): LimitOrder {

        const makerAssetData = ZX;
        const takerAssetData = ZX;

        const { offsets, interactions } = packInteractions({
            makerAssetData,
            takerAssetData,
            getMakingAmount,
            getTakingAmount,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        })

        return {
            salt,
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            receiver,
            allowedSender,
            makingAmount,
            takingAmount,
            offsets,
            interactions,
        };
    }
    /* eslint-enable max-lines-per-function */

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

    /**
     * Get nonce from contract (nonce method) and put it to predicate on order creating
     */
    getCustomAmountData(
        methodName: LimitOrderProtocolMethods,
        makingAmount: string,
        takingAmount: string,
        swapTakerAmount = '0'
    ): string {
        return this.getContractCallData(methodName, [
            makingAmount,
            takingAmount,
            swapTakerAmount,
        ]).substr(0, 2 + 68 * 2);
    }
}
