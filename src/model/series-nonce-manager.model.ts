/**
 * 0-255 uint8
 */
export type Series = bigint;

export const LimitOrderSeries = {
    /**
     * @deprecated Don't use!
     * Preserved just to indicate which values are already takken.
     */
    P2Pv2: <Series>BigInt(1),

    P2Pv3: <Series>BigInt(2),
    // TODO use for gasless bulk cancellation
    // Gaslessv3 = 3,
} as const;

export enum SeriesNonceManagerMethods {
    nonce = 'nonce',
    advanceNonce = 'advanceNonce',
    increaseNonce = 'increaseNonce',
    nonceEquals = 'nonceEquals',
}