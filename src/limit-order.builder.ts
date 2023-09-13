import {
    EIP712_DOMAIN,
    LIMIT_ORDER_PROTOCOL_ABI,
    ZERO_ADDRESS,
    ZX,
} from './limit-order-protocol.const';
import {
    ExtensionParams,
    ExtensionParamsWithCustomData,
    InteractionsV3,
    LimitOrder,
    LimitOrderData, LimitOrderDataLegacy,
    LimitOrderHash,
    LimitOrderInteractions, LimitOrderLegacy,
    LimitOrderProtocolMethods,
    LimitOrderSignature,
    LimitOrderWithExtension,
} from './model/limit-order-protocol.model';
import {EIP712TypedData, MessageTypes, ORDER_STRUCTURE} from './model/eip712.model';
import {ProviderConnector} from './connector/provider.connector';
import {getOffsets, setN, trim0x} from './utils/limit-order.utils';
import Web3 from 'web3';
import {Address} from './model/eth.model';
import {SignTypedDataVersion, TypedDataUtils, TypedMessage} from "@metamask/eth-sig-util";
import {bufferToHex} from 'ethereumjs-util';
import {
    _ALLOW_MULTIPLE_FILLS_FLAG,
    _HAS_EXTENSION_FLAG,
    _NEED_EPOCH_CHECK_FLAG,
    _NEED_POSTINTERACTION_FLAG,
    _NEED_PREINTERACTION_FLAG,
    _NO_PARTIAL_FILLS_FLAG,
    _NO_PRICE_IMPROVEMENT_FLAG,
    _UNWRAP_WETH_FLAG,
    _USE_PERMIT2_FLAG,
    EXPIRY_SHIFT,
    NONCE_SHIFT,
    SERIES_SHIFT
} from "./utils/maker-traits.const";


export function generateOrderSalt(): string {
    return Math.round(Math.random() * Date.now()) + '';
}

export interface EIP712Params {
    domainName: string;
    version: string;
}

export class LimitOrderBuilder {
    constructor(
        private readonly contractAddress: string,
        // private readonly chainId: ChainId | number,
        private readonly providerConnector: ProviderConnector,
        private readonly eip712Params: EIP712Params,
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
        return { offsets: ZX + offsets.toString(16), interactions };
    }

    static packInteractionsLegacy({
                                makerAssetData = ZX,
                                takerAssetData = ZX,
                                getMakingAmount = ZX,
                                getTakingAmount = ZX,
                                predicate = ZX,
                                permit = ZX,
                                preInteraction = ZX,
                                postInteraction = ZX,
                            }: Partial<InteractionsV3>): LimitOrderInteractions {
        const allInteractions = [
            makerAssetData,
            takerAssetData,
            getMakingAmount,
            getTakingAmount,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        ];

        const { offsets, data: interactions } = this.joinStaticCalls(allInteractions);
        return { offsets: ZX + offsets.toString(16), interactions };
    }

    static buildMakerTraits (
        {
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
        } = {}
    ): string {
        return '0x' + (
            (BigInt(series) << BigInt(SERIES_SHIFT)) |
            (BigInt(nonce) << BigInt(NONCE_SHIFT)) |
            (BigInt(expiry) << BigInt(EXPIRY_SHIFT)) |
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

    static joinStaticCalls(data: string[]): { offsets: bigint, data: string } {
        const trimmed = data.map(trim0x);

        return {
            offsets: getOffsets(trimmed),
            data: ZX + trimmed.join(''),
        };
    }

    buildLimitOrderTypedData(
        order: LimitOrder,
        chainId: number,
        verifyingContract: Address,
        domainName = this.eip712Params.domainName
    ): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE,
            },
            domain: {
                name: domainName,
                version: this.eip712Params.version,
                chainId: chainId,
                verifyingContract: verifyingContract,
            },
            message: order,
        };
    }

    buildTypedDataAndSign(
        order: LimitOrder,
        chainId: number,
        verifyingContract: Address,
        wallet: Address,
        domainName = this.eip712Params.domainName
    ): Promise<LimitOrderSignature> {
        const typedData = this.buildLimitOrderTypedData(
            order,
            chainId,
            verifyingContract,
            domainName
        );
        return this.buildOrderSignature(wallet, typedData);
    }

    buildOrderSignature(
        wallet: Address,
        typedData: EIP712TypedData
    ): Promise<LimitOrderSignature> {
        const dataHash = TypedDataUtils.hashStruct(
            typedData.primaryType,
            typedData.message,
            typedData.types,
            SignTypedDataVersion.V4
        ).toString('hex');

        return this.providerConnector.signTypedData(
            wallet,
            typedData,
            dataHash,
        );
    }

    buildLimitOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
        const message = orderTypedData as TypedMessage<MessageTypes>;
        const hash = bufferToHex(TypedDataUtils.eip712Hash(message, SignTypedDataVersion.V4));
        return ZX + hash.substring(2);
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
            makerTraits = LimitOrderBuilder.buildMakerTraits()
        }: LimitOrderData,
        {
            makerAssetSuffix = '0x',
            takerAssetSuffix = '0x',
            makingAmountGetter = '0x',
            takingAmountGetter = '0x',
            predicate = '0x',
            permit = '0x',
            preInteraction = '0x',
            postInteraction = '0x',
            customData = '0x'
        }: ExtensionParamsWithCustomData = {}
    ): LimitOrderWithExtension {

        const { offsets, interactions } = LimitOrderBuilder.packInteractions({
            makerAssetSuffix,
            takerAssetSuffix,
            makingAmountGetter,
            takingAmountGetter,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        });

        const allInteractionsConcat = trim0x(interactions) + trim0x(customData);

        let extension = '0x';
        if (allInteractionsConcat.length > 0) {
            // increase offsets to 256 uint + interactions + customData
            extension += BigInt(offsets).toString(16).padStart(64, '0') + allInteractionsConcat;
        }

        let salt = BigInt(1);
        // if extension exists - put its hash to salt and set flag
        if (trim0x(extension).length > 0) {
            salt = BigInt(Web3.utils.keccak256(extension))
                & ((BigInt(1) << BigInt(160)) - BigInt(1));
            makerTraits = BigInt(makerTraits) | (BigInt(1) << _HAS_EXTENSION_FLAG);
        }

        makerTraits = BigInt(makerTraits);
        if (trim0x(preInteraction).length > 0) {
            makerTraits = BigInt(makerTraits) | (BigInt(1) << _NEED_PREINTERACTION_FLAG);
        }

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
                makerTraits: `0x${makerTraits.toString(16)}`,
            },
            extension
        };
    }

    buildLegacyLimitOrder({
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
                        salt = generateOrderSalt(),
                    }: LimitOrderDataLegacy
    ): LimitOrderLegacy {

        const makerAssetData = ZX;
        const takerAssetData = ZX;

        const { offsets, interactions } = LimitOrderBuilder.packInteractionsLegacy({
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
