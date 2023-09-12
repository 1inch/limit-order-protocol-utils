import { TypedDataVersion } from '@1inch/solidity-utils';
import { TypedDataUtils } from '@metamask/eth-sig-util';
import { cutSelector } from './utils';
import { ethers } from 'hardhat'

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

function buildData(owner, name, version, chainId, verifyingContract, spender, nonce, value, deadline) {
    return {
        domain: { name, version, chainId, verifyingContract },
        types: { Permit },
        value: { owner, spender, value, nonce, deadline },
    };
}

const defaultDeadline = '18446744073709551615';

// eslint-disable-next-line max-params
export async function getPermit(
    owner, wallet, token, tokenVersion, chainId, spender, value, deadline = defaultDeadline
): Promise<string> {
    const nonce = await token.nonces(owner);
    const name = await token.name();
    const data = buildData(
        owner, name, tokenVersion, chainId, token.address, spender, nonce, value, deadline
    );
    const signature = await wallet._signTypedData(data.domain, data.types, data.value);
    const { v, r, s } = ethers.utils.splitSignature(signature);
    const permitCall = token.interface.encodeFunctionData(
        'permit', [owner, spender, value, deadline, v, r, s]
    );
    return cutSelector(permitCall);
}
