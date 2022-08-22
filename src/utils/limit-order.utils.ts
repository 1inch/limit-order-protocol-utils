import {ZX} from '../limit-order-protocol.const';

export function trim0x(hexString: string): string {
    if (hexString.startsWith('0x')) {
        return hexString.substring(2);
    }
    return hexString;
}

// todo think about naming
export function getOffsets(data: string[]): string {
    return data
        .map(a => a.length / 2 - 1)
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

const cumulativeSum = ((sum: bigint) => (value: bigint) => {
    sum += value;
    return sum;
})
(BigInt(0));


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
