import {
    InteractionName,
    Interactions,
    InteractionsFields,
} from "./model/limit-order-protocol.model";
import {
    parseInteractionForField,
    trim0x,
    UINT32_BITMASK,
    UINT32_BITS,
} from "./utils/limit-order.utils";


export class LimitOrderDecoder {
    static unpackInteractions(offsets: string | bigint, interactions: string): Interactions {
        const offsetsBN = BigInt(offsets);

        const parsedInteractions = {} as Interactions;

        Object.entries(InteractionsFields).forEach(([name, position]) => {
            parsedInteractions[name as InteractionName] = parseInteractionForField(
                offsetsBN,
                interactions,
                position as number,
            );
        });

        return parsedInteractions
    }

    // static unpackInteraction<T extends InteractionName>(
    //     order: LimitOrder,
    //     name: T,
    // ): Interactions[T] {
    //     return parseInteractionForField(
    //         BigInt(order.offsets),
    //         order.interactions,
    //         InteractionsFields[name],
    //     )
    // }

    /**
     * @returns `true` if interaction value is empty of 0x
     */
    // static hasInteraction(order: LimitOrder, name: InteractionName): boolean {
    //     const interaction = this.unpackInteraction(order, name);
    //
    //     return trim0x(interaction) !== '';
    // }

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
}
