import {
    InteractionV3Name,
    InteractionsV3,
    InteractionsFieldsV3,
    UnpackedExtension,
    AllInteractions,
    Interactions,
    InteractionsFields,
    LimitOrderLegacy,
    MakerTraits,
    ParsedMakerTraits,
} from "./model/limit-order-protocol.model";
import {
    parseInteractionForField,
    trim0x,
    UINT32_BITMASK,
    UINT32_BITS,
    getN,
} from "./utils/limit-order.utils";
import { ZX } from "./limit-order-protocol.const";

import {
    _ALLOW_MULTIPLE_FILLS_FLAG,
    _NEED_EPOCH_CHECK_FLAG,
    _NO_PARTIAL_FILLS_FLAG,
    _NO_PRICE_IMPROVEMENT_FLAG,
    _UNWRAP_WETH_FLAG,
    _USE_PERMIT2_FLAG, ALLOWED_SENDER_MASK,
    EXPIRY_MASK,
    EXPIRY_SHIFT,
    NONCE_MASK,
    NONCE_SHIFT,
    SERIES_MASK,
    SERIES_SHIFT
} from "./utils/maker-traits.const";


export class LimitOrderDecoder {
    static unpackExtension(extension: string): UnpackedExtension {
        extension = trim0x(extension);
        const offsetsInHex = ZX + extension.slice(0, 64);
        const offsets = BigInt(offsetsInHex);

        const interactions = LimitOrderDecoder.unpackInteractions(
            offsets,
            extension.slice(64, extension.length)
        );

        const extensionBigInt = BigInt(ZX + extension);
        const offset = (extensionBigInt >> BigInt(224)) + BigInt(0x20);

        const customData = ZX + extension.slice(
            Number(offset),
            extension.length
        );

        return {
            interactions: interactions ?? ZX,
            customData: customData ?? ZX,
        }
    }

    static unpackMakerTraits(makerTraits: MakerTraits): ParsedMakerTraits {
        const makerTraitsAsBigInt = BigInt(makerTraits);
        const series =
            (makerTraitsAsBigInt >> BigInt(SERIES_SHIFT)) & SERIES_MASK;

        const nonce =
            (makerTraitsAsBigInt >> BigInt(NONCE_SHIFT)) & NONCE_MASK;

        const expiry =
            (makerTraitsAsBigInt >> BigInt(EXPIRY_SHIFT)) & EXPIRY_MASK;

        const allowedSender = makerTraitsAsBigInt & ALLOWED_SENDER_MASK;

        const unwrapWeth = !!getN(makerTraitsAsBigInt, _UNWRAP_WETH_FLAG);
        const allowMultipleFills = !!getN(makerTraitsAsBigInt, _ALLOW_MULTIPLE_FILLS_FLAG);
        const allowPartialFill = !getN(makerTraitsAsBigInt, _NO_PARTIAL_FILLS_FLAG);
        const allowPriceImprovement = !getN(makerTraitsAsBigInt, _NO_PRICE_IMPROVEMENT_FLAG);
        const shouldCheckEpoch = !!getN(makerTraitsAsBigInt, _NEED_EPOCH_CHECK_FLAG);
        const usePermit2 = !!getN(makerTraitsAsBigInt, _USE_PERMIT2_FLAG);

        return {
            series: Number(series),
            expiry: Number(expiry),
            nonce: Number(nonce),
            allowedSender: ZX + allowedSender.toString(16).padEnd(40, '0'),
            unwrapWeth,
            allowMultipleFills,
            allowPartialFill,
            allowPriceImprovement,
            shouldCheckEpoch,
            usePermit2,
        }
    }

    static unpackInteractionsV3(offsets: string | bigint, interactions: string): InteractionsV3 {
        return LimitOrderDecoder.unpackAllInteractions(offsets, interactions, InteractionsFieldsV3) as InteractionsV3;
    }

    static unpackInteractions(offsets: string | bigint, interactions: string): Interactions {
        return LimitOrderDecoder.unpackAllInteractions(offsets, interactions, InteractionsFields) as Interactions;
    }

    static unpackInteraction<T extends InteractionV3Name>(
        order: LimitOrderLegacy,
        name: T,
    ): InteractionsV3[T] {
        return parseInteractionForField(
            BigInt(order.offsets),
            order.interactions,
            InteractionsFieldsV3[name],
        )
    }

    /**
     * @returns `true` if interaction value is empty of 0x
     */
    static hasInteraction(order: LimitOrderLegacy, name: InteractionV3Name): boolean {
        const interaction = this.unpackInteraction(order, name);

        return trim0x(interaction) !== '';
    }

    static unpackStaticCalls(offsets: string | bigint, interactions: string): string[] {
        const offsetsBI = BigInt(offsets);
        const data = trim0x(interactions);

        const result: string[] = [];
        let previous = BigInt(0);
        let current = BigInt(0);
        // See PredicateHelper.and in limit-order-protocol
        for (
            let i = BigInt(0);
            (current = (offsetsBI >> i) & UINT32_BITMASK);
            i += UINT32_BITS
        ) {
            const calldata = data.slice(Number(previous) * 2, Number(current) * 2);
            result.push(calldata);
            previous = current;
        }

        return result;
    }

    private static unpackAllInteractions(
        offsets: string | bigint,
        interactions: string,
        interactionsFields: AllInteractions,
    ): InteractionsV3 | Interactions {
        const offsetsBN = BigInt(offsets);

        const parsedInteractions = {} as Partial<Interactions | InteractionsV3>;

        Object.entries(interactionsFields).forEach(([name, position]) => {
            parsedInteractions[name as keyof AllInteractions] = parseInteractionForField(
                offsetsBN,
                interactions,
                position as number,
            );
        });

        return parsedInteractions as Interactions | InteractionsV3;
    }
}
