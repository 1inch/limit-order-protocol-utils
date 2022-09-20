import {ZX} from '../limit-order-protocol.const';

export function trim0x(hexString: string): string {
    if (hexString.startsWith('0x')) {
        return hexString.substring(2);
    }
    return hexString;
}

export function getOffsets(data: string[], subtrahend = 0): string {
    const cumulativeSum = ((sum: bigint) => (value: bigint) => {
        sum += value;
        return sum;
    })
    (BigInt(0));

    return data
        .map(a => a.length / 2 - subtrahend)
        .map(val => BigInt(val))
        .map(cumulativeSum)
        .reduce((acc, a, i) => {
            return acc + (BigInt(a) << ((BigInt(32) * BigInt(i))));
        }, BigInt(0))
        .toString();
}

export function joinStaticCalls (data: string[]): { offsets: string, data: string } {
    const trimmed = data.map(trim0x);

    return {
        offsets: getOffsets(trimmed),
        data: ZX + trimmed.join(''),
    };
}


export function parseSimulateResult(
    result: string
): { success: boolean; result: string } | null {
    const successResponseRegexp =
        /SimulationResults\((true|false),*.("0x\d*")\)/gi;

    const parsedResult = successResponseRegexp.exec(result);

    if (parsedResult?.length === 3) {
        return {
            success: parsedResult[1] === 'true',
            result: parsedResult[2],
        };
    }

    return null;
}


export function getMakingAmountForRFQ(amount: string): string {
    return setN(BigInt(amount), 255, true).toString();
}

function setN(value: bigint, bitNumber: number, flag: boolean): bigint {
    const bit = flag ? 1 : 0;
    return value | (BigInt(bit) << BigInt(bitNumber));
}
