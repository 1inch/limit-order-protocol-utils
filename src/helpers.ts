/**
 * Public utils interface
 */
import { ZX } from "./limit-order-protocol.const";
import { LimitOrder, LimitOrderInteractions } from "./model/limit-order-protocol.model";
import { joinStaticCalls, parseInteractionForField, trim0x } from "./utils/limit-order.utils";

export { trim0x } from './utils/limit-order.utils';


export const InteractionsFields = {
    makerAssetData: 0,
    takerAssetData: 1,
    getMakingAmount: 2,
    getTakingAmount: 3,
    predicate: 4,
    permit: 5,
    preInteraction: 6,
    postInteraction: 7,
// cuz enum has numeric keys also
} as const;

export type InteractionName = keyof typeof InteractionsFields;

export type Interactions = {
    [key in InteractionName]: string;
};

// eslint-disable-next-line max-lines-per-function
export function packInteractions({
    makerAssetData = ZX,
    takerAssetData = ZX,
    getMakingAmount = ZX,
    getTakingAmount = ZX,
    predicate = ZX,
    permit = ZX,
    preInteraction = ZX,
    postInteraction = ZX,
}: Partial<Interactions>): LimitOrderInteractions {
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

    const { offsets, data: interactions } = joinStaticCalls(allInteractions);
    return { offsets, interactions };
}

export function unpackInteractions(offsets: string | bigint, interactions: string): Interactions {
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

export function unpackInteraction<T extends InteractionName>(
    order: LimitOrder,
    name: T,
): Interactions[T] {
    return parseInteractionForField(
        BigInt(order.offsets),
        order.interactions,
        InteractionsFields[name],
    )
}

/**
 * @returns `true` if interaction value is empty of 0x
 */
export function hasInteraction(order: LimitOrder, name: InteractionName): boolean {
    const interaction = unpackInteraction(order, name);

    return trim0x(interaction) !== '';
}
