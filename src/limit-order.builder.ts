import {
    ZERO_ADDRESS,
    ZX,
} from './limit-order-protocol.const';
import {
    ExtensionParams,
    ExtensionParamsWithCustomData,
    LimitOrder,
    LimitOrderData,
    LimitOrderInteractions,
    LimitOrderWithExtension,
} from './model/limit-order-protocol.model';
import {
    EIP712Parameter,
    ORDER_STRUCTURE,
} from './model/eip712.model';
import {ProviderConnector} from './connector/provider.connector';
import {setN, trim0x} from './utils/limit-order.utils';
import Web3 from 'web3';
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
import {BaseLimitOrderBuilder} from "./base-limit-order.builder";
import {generateSalt} from './utils/generate-salt';

export function generateOrderSalt(): string {
    return Math.round(Math.random() * Date.now()) + '';
}

export interface EIP712Params {
    domainName: string;
    version: string;
}

export interface EIP712ParamsExtended extends EIP712Params {
    orderStructure: EIP712Parameter[];
}

export class LimitOrderBuilder extends BaseLimitOrderBuilder<LimitOrder> {
    constructor(
        protected readonly providerConnector: ProviderConnector,
        protected readonly eip712Params: EIP712Params,
    ) {
        super(providerConnector, {
            ...eip712Params,
            orderStructure: ORDER_STRUCTURE,
        });
    }

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
         nonce = BigInt(0),
         series = BigInt(0),
        } = {}
    ): string {
        return '0x' + (
            (series << BigInt(SERIES_SHIFT)) |
            (nonce << BigInt(NONCE_SHIFT)) |
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
            makerTraits = LimitOrderBuilder.buildMakerTraits(),
            salt = generateSalt(),
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

        salt = BigInt(salt);
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
            salt: salt.toString(),
            maker,
            receiver,
            makerAsset,
            takerAsset,
            makingAmount,
            takingAmount,
            makerTraits: `0x${makerTraits.toString(16)}`,
            extension
        };
    }
}
