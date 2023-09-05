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
    ChainId, ExtensionParams, ExtensionParamsWithCustomData,
    LimitOrder,
    LimitOrderData,
    LimitOrderHash,
    LimitOrderInteractions,
    LimitOrderProtocolMethods,
    LimitOrderSignature, LimitOrderWithExtension,
    RFQOrder,
    RFQOrderData,
} from './model/limit-order-protocol.model';
import {EIP712TypedData, MessageTypes} from './model/eip712.model';
import {bufferToHex} from 'ethereumjs-util';
import {SignTypedDataVersion, TypedDataUtils, TypedMessage} from '@metamask/eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';
import {getOffsets, setN, trim0x} from './utils/limit-order.utils';
import Web3 from 'web3';

const _NO_PARTIAL_FILLS_FLAG = BigInt(255);
const _ALLOW_MULTIPLE_FILLS_FLAG = BigInt(254);
const _NO_PRICE_IMPROVEMENT_FLAG = BigInt(253);
const _NEED_PREINTERACTION_FLAG = BigInt(252);
const _NEED_POSTINTERACTION_FLAG = BigInt(251);
const _NEED_EPOCH_CHECK_FLAG = BigInt(250);
const _HAS_EXTENSION_FLAG = BigInt(249);
const _USE_PERMIT2_FLAG = BigInt(248);
const _UNWRAP_WETH_FLAG = BigInt(247);

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
    ) {}

    static packInteractions(
        {
            makerAssetSuffix,
            takerAssetSuffix,
            makingAmountGetter,
            takingAmountGetter,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        }: ExtensionParams): LimitOrderInteractions {
        const allInteractions = [
            makerAssetSuffix,
            takerAssetSuffix,
            makingAmountGetter,
            takingAmountGetter,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        ];

        const { offsets, data: interactions } = this.joinStaticCalls(allInteractions);
        return { offsets, interactions };
    }

    static joinStaticCalls(data: string[]): { offsets: bigint, data: string } {
        const trimmed = data.map(trim0x);

        return {
            offsets: getOffsets(trimmed),
            data: ZX + trimmed.join(''),
        };
    }

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

    buildMakerTraits ({
       allowedSender = ZERO_ADDRESS,
       shouldCheckEpoch = false,
       allowPartialFill = true,
       allowPriceImprovement = true,
       allowMultipleFills = true,
       usePermit2 = false,
       unwrapWeth = false,
       expiry = 0,
       nonce = 0,
       series = 0,
   } = {}) {
        // assert(BigInt(expiry) >= BigInt(0) && BigInt(expiry) < (BigInt(1) << BigInt(40)), 'Expiry should be less than 40 bits');
        // assert(BigInt(nonce) >= 0 && BigInt(nonce) < (BigInt(1) << BigInt(40)), 'Nonce should be less than 40 bits');
        // assert(BigInt(series) >= 0 && BigInt(series) < (BigInt(1) << BigInt(40)), 'Series should be less than 40 bits');

        return '0x' + (
            (BigInt(series) << BigInt(160)) |
            (BigInt(nonce) << BigInt(120)) |
            (BigInt(expiry) << BigInt(80)) |
            (BigInt(allowedSender) & ((BigInt(1) << BigInt(80)) - BigInt(1))) |
            // 247 - 255
            setN(BigInt(0), _UNWRAP_WETH_FLAG, unwrapWeth) |
            setN(BigInt(0), _ALLOW_MULTIPLE_FILLS_FLAG, allowMultipleFills) |
            setN(BigInt(0), _NO_PARTIAL_FILLS_FLAG, !allowPartialFill) |
            setN(BigInt(0), _NO_PRICE_IMPROVEMENT_FLAG, !allowPriceImprovement) |
            setN(BigInt(0), _NEED_EPOCH_CHECK_FLAG, shouldCheckEpoch) |
            setN(BigInt(0), _USE_PERMIT2_FLAG, usePermit2)
            // 256 bit value
        ).toString(16).padStart(64, '0');
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
            message: {
                ...order
            },
        };
    }

    buildRFQOrder({
        id,
        wrapEth = false,
        expiresInTimestamp,
        makerAssetAddress,
        takerAssetAddress,
        makerAddress,
        allowedSender = ZERO_ADDRESS,
        makingAmount,
        takingAmount,
    }: RFQOrderData): RFQOrder {
        return {
            info: generateRFQOrderInfo(id, expiresInTimestamp, wrapEth),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            allowedSender,
            makingAmount,
            takingAmount,
        };
    }

    /**
     * @param allowedSender formerly `takerAddress`
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
    buildLimitOrder(
        {
            maker,
            receiver = ZERO_ADDRESS,
            makerAsset,
            takerAsset,
            makingAmount,
            takingAmount,
            makerTraits = this.buildMakerTraits()
        }: LimitOrderData,
        extensionParams: ExtensionParamsWithCustomData
    ): LimitOrderWithExtension {

        const { offsets, interactions } = LimitOrderBuilder.packInteractions(extensionParams);

        const allInteractionsConcat = interactions + trim0x(extensionParams.customData);

        let extension = '0x';
        if (allInteractionsConcat.length > 0) {
            // increase offsets to 256 uint + interactions + customData
            extension += offsets.toString(16).padStart(64, '0') + allInteractionsConcat;
        }

        let salt = BigInt(1);
        // if extension exists - put its hash to salt and set flag
        if (trim0x(extension).length > 0) {
            salt = BigInt(Web3.utils.keccak256(extension))
                & ((BigInt(1) << BigInt(160)) - BigInt(1));
            // wtf?
            makerTraits = BigInt(makerTraits) | (BigInt(1) << _HAS_EXTENSION_FLAG);
        }

        const { preInteraction } = extensionParams;
        makerTraits = BigInt(makerTraits);
        if (trim0x(preInteraction).length > 0) {
            makerTraits = BigInt(makerTraits) | (BigInt(1) << _NEED_PREINTERACTION_FLAG);
        }

        const { postInteraction } = extensionParams;
        if (trim0x(postInteraction).length > 0) {
            makerTraits = BigInt(makerTraits) | (BigInt(1) << _NEED_POSTINTERACTION_FLAG);
        }

        return {
            order: {
                salt: salt.toString(),
                maker,
                receiver,
                makerAsset,
                takerAsset,
                makingAmount,
                takingAmount,
                makerTraits: makerTraits.toString(),
            },
            extension
        };
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
