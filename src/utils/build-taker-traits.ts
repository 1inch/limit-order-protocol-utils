import {trim0x} from "./limit-order.utils";
import {solidityPacked} from "ethers";

const TakerTraitsConstants = {
    _MAKER_AMOUNT_FLAG: BigInt(1) << BigInt(255),
    _UNWRAP_WETH_FLAG: BigInt(1) << BigInt(254),
    _SKIP_ORDER_PERMIT_FLAG: BigInt(1) << BigInt(253),
    _USE_PERMIT2_FLAG: BigInt(1) << BigInt(252),
    _ARGS_HAS_TARGET: BigInt(1) << BigInt(251),

    _ARGS_EXTENSION_LENGTH_OFFSET: BigInt(224),
    _ARGS_EXTENSION_LENGTH_MASK: 0xffffff,
    _ARGS_INTERACTION_LENGTH_OFFSET: BigInt(200),
    _ARGS_INTERACTION_LENGTH_MASK: 0xffffff,
};

export function buildTakerTraits({
                                     makingAmount = false,
                                     unwrapWeth = false,
                                     skipMakerPermit = false,
                                     usePermit2 = false,
                                     target = '0x',
                                     extension = '0x',
                                     interaction = '0x',
                                     threshold = BigInt(0),
                                 } = {}): { traits: bigint, args: string } {
    return {
        traits: BigInt(threshold) | (
            (makingAmount ? TakerTraitsConstants._MAKER_AMOUNT_FLAG : BigInt(0)) |
            (unwrapWeth ? TakerTraitsConstants._UNWRAP_WETH_FLAG : BigInt(0)) |
            (skipMakerPermit ? TakerTraitsConstants._SKIP_ORDER_PERMIT_FLAG : BigInt(0)) |
            (usePermit2 ? TakerTraitsConstants._USE_PERMIT2_FLAG : BigInt(0)) |
            (trim0x(target).length > 0 ? TakerTraitsConstants._ARGS_HAS_TARGET : BigInt(0)) |
            (
                BigInt(trim0x(extension).length / 2)
                << TakerTraitsConstants._ARGS_EXTENSION_LENGTH_OFFSET
            ) |
            (
                BigInt(trim0x(interaction).length / 2)
                << TakerTraitsConstants._ARGS_INTERACTION_LENGTH_OFFSET
            )
        ),
        args: solidityPacked(
            ['bytes', 'bytes', 'bytes'],
            [target, extension, interaction],
        ),
    };
}
