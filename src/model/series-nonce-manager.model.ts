/**
 * uint8 (0-255)
 */
export type Series = bigint;

/**
 * @deprecated
 */
export const NonceSeriesLegacyV1 = {
    P2Pv2: <Series>BigInt(1),
} as const;


export const NonceSeriesV2 = {
    /**
     * This is not a valid option.
     *
     * @deprecated Gasless should use main contract's built-in nonce manager
     * to avoid arbitraryStaticCall() and save gas.
     */
    GaslessV3: <Series | null>BigInt(-1), // should lead to "execution reverted"

    // Those are valid
    _GaslessV3: <Series>BigInt(-1), // for internal usage
    LimitOrderV3: <Series>BigInt(0),
    P2PV3: <Series>BigInt(1),
} as const;

export enum SeriesNonceManagerMethods {
    nonce = 'nonce',
    advanceNonce = 'advanceNonce',
    increaseNonce = 'increaseNonce',
    nonceEquals = 'nonceEquals',
    // Don't expose timestampBelow as it's usless.
    timestampBelowAndNonceEquals = 'timestampBelowAndNonceEquals',
}
