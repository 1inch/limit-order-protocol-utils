import {ZX} from '../limit-order-protocol.const';

export const UINT32_BITS = BigInt(32);
export const UINT32_BITMASK = BigInt('0xFFFFFFFF');
export const UINT48_BITMASK = BigInt('0xFFFFFFFFFFFF');
export const ADDRESS_MASK = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

export function trim0x(hexString: string): string {
    if (hexString.startsWith('0x')) {
        return hexString.substring(2);
    }
    return hexString;
}

export function getOffsets(data: string[]): string {
    const cumulativeSum = ((sum: bigint) => (value: bigint) => {
        sum += value;
        return sum;
    })
    (BigInt(0));

    return data
        .map((hex) => {
            if (hex.startsWith(ZX))
                return BigInt(hex.length / 2 - 1);

            return BigInt(hex.length / 2);
        })
        .map(cumulativeSum)
        .reduce((bytesAccumularot, offset, index) => {
            return bytesAccumularot + (BigInt(offset) << ((UINT32_BITS * BigInt(index))));
        }, BigInt(0))
        .toString();
}

export function joinStaticCalls(data: string[]): { offsets: string, data: string } {
    const trimmed = data.map(trim0x);

    return {
        offsets: getOffsets(trimmed),
        data: ZX + trimmed.join(''),
    };
}

export function unpackStaticCalls(offsets: string | bigint, interactions: string): string[] {
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

export function parseInteractionForField(
    offsets: bigint,
    interactions: string,
    field: number,
): string {
    const {fromByte, toByte} = getOffsetForInteraction(offsets, field)

    return '0x' + trim0x(interactions).slice(fromByte * 2, toByte * 2)
}

function getOffsetForInteraction(offsets: bigint, field: number) {
    const fromByteBN = field === 0
        ? '0'
        : offsets >> BigInt((field - 1) * 32) & UINT32_BITMASK;
    const toByteBN = offsets >> BigInt(field * 32) & UINT32_BITMASK;

    return {
        fromByte: parseInt(fromByteBN.toString()),
        toByte: parseInt(toByteBN.toString())
    }
}


export function getMakingAmountForRFQ(amount: string): string {
    return setN(BigInt(amount), 255, true).toString();
}

function setN(value: bigint, bitNumber: number, flag: boolean): bigint {
    const bit = flag ? 1 : 0;
    return value | (BigInt(bit) << BigInt(bitNumber));
}

export const TIMESTAMP_AND_NOUNCE_SELECTOR = '2cc2878d'; // timestampBelowAndNonceEquals(uint256)
const TIMESTAMP_AND_NOUNCE_ARGS_SIZE = 256 / 4;
const PREDICATE_REGEX = new RegExp(`^\\w*${TIMESTAMP_AND_NOUNCE_SELECTOR}`, 'g');

export function unpackTimestampAndNoncePredicate(callData: string): {
    address: string,
    nonce: bigint,
    timestamp: bigint,
} {
    const calldata = trim0x(callData).length <= TIMESTAMP_AND_NOUNCE_ARGS_SIZE
        ? trim0x(callData)
        : trim0x(callData).replace(
            PREDICATE_REGEX,
            '',
        ).substring(0, TIMESTAMP_AND_NOUNCE_ARGS_SIZE);

    const timeNonceAccount = BigInt(ZX + calldata);
    return {
        address: ZX + (timeNonceAccount >> BigInt(0) & ADDRESS_MASK).toString(16),
        nonce: timeNonceAccount >> BigInt(160) & UINT48_BITMASK,
        timestamp: timeNonceAccount >> BigInt(208) & UINT48_BITMASK,
    }
}

export function packSkipPermitAndThresholdAmount(
    thresholdAmount: string,
    skipPermit: boolean,
): string {
    const skipPermitAndThresholdAmount = BigInt(ZX + trim0x(thresholdAmount))
        + (BigInt(skipPermit) << BigInt(255));

    return skipPermitAndThresholdAmount.toString(16);
}
