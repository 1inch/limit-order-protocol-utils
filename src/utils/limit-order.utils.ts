import {ZX} from '../limit-order-protocol.const';

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
        .reduce((acc, a, i) => {
            return acc + (BigInt(a) << ((BigInt(32) * BigInt(i))));
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

export function parseInteractionForField(
    offsets: bigint,
    interactions: string,
    field: number,
): string {
    const {fromByte, toByte} = getOffsetForInteraction(offsets, field)

    return '0x' + trim0x(interactions).slice(fromByte * 2, toByte * 2)
}

function getOffsetForInteraction(offsets: bigint, field: number) {
    const mask = BigInt('0xFFFFFFFF');
    const fromByteBN = field === 0
        ? '0'
        : offsets >> BigInt((field - 1) * 32) & mask;
    const toByteBN = offsets >> BigInt(field * 32) & mask;

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

export const ADDRESS_MASK = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
export const TIMESTAMP_AND_NOUNCE_SELECTOR = '2cc2878d';

const PREDICATE_REGEX = new RegExp(`^\\w*${TIMESTAMP_AND_NOUNCE_SELECTOR}0*`, 'g')

export function unpackTimestampAndNoncePredicate(callData: string): {
    address: string,
    nonce: bigint,
    timestamp: bigint,
} {
    const predicateCalldata = trim0x(callData).length <= 60
        ? trim0x(callData)
        : trim0x(callData).replace(
            PREDICATE_REGEX,
            '',
        ).substring(0, 60);

    const predicateValue = BigInt(ZX + predicateCalldata);
    return {
        address: ZX + (predicateValue >> BigInt(0) & ADDRESS_MASK).toString(16),
        nonce: predicateValue >> BigInt(160) & BigInt('0xFFFFFF'),
        timestamp: predicateValue >> BigInt(208) & BigInt('0xFFFFFFFF'),
    }
}
