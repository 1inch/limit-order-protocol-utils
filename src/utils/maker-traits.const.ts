export const _NO_PARTIAL_FILLS_FLAG = BigInt(255);
export const _ALLOW_MULTIPLE_FILLS_FLAG = BigInt(254);
export const _NO_PRICE_IMPROVEMENT_FLAG = BigInt(253);
export const _NEED_PREINTERACTION_FLAG = BigInt(252);
export const _NEED_POSTINTERACTION_FLAG = BigInt(251);
export const _NEED_EPOCH_CHECK_FLAG = BigInt(250);
export const _HAS_EXTENSION_FLAG = BigInt(249);
export const _USE_PERMIT2_FLAG = BigInt(248);
export const _UNWRAP_WETH_FLAG = BigInt(247);
export const SERIES_SHIFT = BigInt(160);

export const SERIES_MASK = (BigInt(1) << BigInt(40)) - BigInt(1);
export const NONCE_SHIFT = BigInt(120);
export const NONCE_MASK = (BigInt(1) << BigInt(40)) - BigInt(1);
export const EXPIRY_SHIFT = BigInt(80);
export const EXPIRY_MASK = (BigInt(1) << BigInt(40)) - BigInt(1);

export const ALLOWED_SENDER_MASK = (BigInt(1) << BigInt(80)) - BigInt(1);
