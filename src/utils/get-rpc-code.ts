import Web3 from 'web3';

interface RPCError {
    code: number;
    data: string;
    message: string;
}

export function getRPCCode(response: string): string | null {
    const objectRegexp = /{(\n*|.*)*}/gi; // take all between { }
    const match = response.match(objectRegexp);
    const matched = match ? match[0] : null;

    const rpcError = matched ? parseErrorObject(matched) : null;
    const data = rpcError ? rpcError.data : null;
    return data ? extractCodeFromData(data) : null;
}

function extractCodeFromData(data: string): string | null {
    const hexRegexp = /0[xX][0-9a-fA-F]+/;
    const matched = data.match(hexRegexp);
    const hex = matched?.[0];

    return hex ? Web3.utils.hexToAscii(hex) : null;
}

function parseErrorObject(errorObjectString: string): RPCError | null {
    try {
        return JSON.parse(errorObjectString) as RPCError;
    } catch (e) {
        return null;
    }
}
