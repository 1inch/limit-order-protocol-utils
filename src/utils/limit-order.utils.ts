import { Series } from '../model/series-nonce-manager.model';
import {ZX} from '../limit-order-protocol.const';
import { ErrorResponse } from '../limit-order-protocol.facade';

export const UINT32_BITS = BigInt(32);
export const UINT32_BITMASK = BigInt('0xFFFFFFFF');
export const UINT16_BITMASK = BigInt('0xFFFF');
export const UINT40_BITMASK = BigInt('0xFFFFFFFFFF');
export const UINT48_BITMASK = BigInt('0xFFFFFFFFFFFF');
export const ADDRESS_MASK = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

export function trim0x(hexString: string): string {
    if (hexString.startsWith('0x')) {
        return hexString.substring(2);
    }
    return hexString;
}

export function getOffsets(data: string[]): bigint {
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

export function setN(value: bigint, bitNumber: number | bigint, flag: boolean): bigint {
    const bit = flag ? 1 : 0;
    return value | (BigInt(bit) << BigInt(bitNumber));
}

export const TIMESTAMP_AND_NOUNCE_SELECTOR = '2cc2878d'; // timestampBelowAndNonceEquals(uint256)
export const ARBITRARY_STATIC_CALL_SELECTOR = '7638f1fe'; // timestampBelowAndNonceEquals(uint256)
const TIMESTAMP_AND_NOUNCE_ARGS_SIZE = 256 / 4;
const PREDICATE_REGEX = new RegExp(`^\\w*${TIMESTAMP_AND_NOUNCE_SELECTOR}`, 'g');

/**
 *
 * @param calldata Any variant of calldata, such as
 * - complete predicate
 * - full method calldata
 * - arguments calldata
 * - argument value as hex or bigint
 * @param isSeriesNonceManager Omit if you dont know exacly.
 * Loose `arbitraryStaticCall` check will be performed
 * @returns
 */
// eslint-disable-next-line max-lines-per-function
export function unpackTimestampAndNoncePredicate(
    calldata: string | bigint,
    isSeriesNonceManager: boolean | null = null,
): {
    series?: Series,
    address: string,
    nonce: bigint,
    timestamp: bigint,
} {
    const hex = trim0x(
        typeof calldata === 'string'
            ? calldata
            : BigInt(calldata).toString(16)
    );
    const timeNonceSeriesAccount = hex.length <= TIMESTAMP_AND_NOUNCE_ARGS_SIZE
        ? hex
        : hex.replace(
            PREDICATE_REGEX,
            '',
        ).substring(0, TIMESTAMP_AND_NOUNCE_ARGS_SIZE);

    const timeNonceAccount = BigInt(ZX + timeNonceSeriesAccount);

    const arbitraryStaticCallIndex = hex.indexOf(ARBITRARY_STATIC_CALL_SELECTOR);
    if (
        isSeriesNonceManager
        || (
            isSeriesNonceManager !== null
            && arbitraryStaticCallIndex < hex.indexOf(TIMESTAMP_AND_NOUNCE_SELECTOR)
        )
    ) {
        return {
            address: ZX + (timeNonceAccount >> BigInt(0) & ADDRESS_MASK).toString(16),
            series: timeNonceAccount >> BigInt(160) & UINT16_BITMASK,
            nonce: timeNonceAccount >> BigInt(160 + 16) & UINT40_BITMASK,
            timestamp: timeNonceAccount >> BigInt(160 + 16 + 40) & UINT40_BITMASK,
        }
    }

    return {
        address: ZX + (timeNonceAccount >> BigInt(0) & ADDRESS_MASK).toString(16),
        nonce: timeNonceAccount >> BigInt(160) & UINT48_BITMASK,
        timestamp: timeNonceAccount >> BigInt(208) & UINT48_BITMASK,
    }
}

function setBit(num: bigint, bitPosition: number, bitValue: boolean): bigint {
    if (bitValue) {
        return BigInt(num) | (BigInt(1) << BigInt(bitPosition));
    } else {
        return BigInt(num) & (~(BigInt(1) << BigInt(bitPosition)));
    }
}

export function packSkipPermitAndThresholdAmount(
    thresholdAmount: string,
    skipPermit: boolean,
): string {
    const thresholdBigInt = BigInt(thresholdAmount);
    const skipPermitAndThresholdAmount = setBit(thresholdBigInt, 255, skipPermit)
    return '0x' + skipPermitAndThresholdAmount.toString(16);
}

export function extractWeb3OriginalErrorData(error: ErrorResponse | Error | string): string | null {
    if (error && typeof error !== 'string' && (error as ErrorResponse).data) {
        return (error as ErrorResponse).data;
    }

    const message = (error && typeof error !== 'string')
        ? error.message
        : error as string;

    const bracesIndexStart = message.indexOf('{');
    const bracesIndexEnd = message.lastIndexOf('}');

    if ((bracesIndexStart + 1) && (bracesIndexEnd + 1)) {
        try {
            const json = JSON.parse(message.substring(bracesIndexStart, bracesIndexEnd + 1));

            if (json.originalError) {
                return json.originalError.data;
            } else if (json.data) {
                return json.data;
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    if (message.startsWith(ZX)) {
        return message;
    }

    return null;
}
