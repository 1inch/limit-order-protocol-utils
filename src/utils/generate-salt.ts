export function generateSalt(): bigint {
    // uint256 is 32 bytes
    const buffer = new Uint8Array(32);
    window.crypto.getRandomValues(buffer);
    const slicedBytes = Array.from(buffer)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    return BigInt(`0x${slicedBytes}`);
}
