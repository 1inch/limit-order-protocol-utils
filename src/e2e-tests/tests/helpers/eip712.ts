import { cutSelector } from './utils';
import { ethers } from 'hardhat'
import {Address} from "../../../model/limit-order-protocol.model";
import {
    SignerWithAddress,
} from "@1inch/solidity-utils/node_modules/@nomiclabs/hardhat-ethers/signers";
import {Contract} from "ethers";
import {splitSignature} from "ethers/lib/utils";

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

// eslint-disable-next-line max-params
function buildData(
    owner: Address,
    name: string,
    version: string,
    chainId: number,
    verifyingContract: Address,
    spender: Address,
    nonce: number,
    value: string,
    deadline: string
) {
    return {
        domain: { name, version, chainId, verifyingContract },
        types: { Permit },
        value: { owner, spender, value, nonce, deadline },
    };
}

const defaultDeadline = '18446744073709551615';

// eslint-disable-next-line max-params
export async function getPermit(
    owner: Address,
    wallet: SignerWithAddress,
    token: Contract,
    tokenVersion: string,
    chainId: number,
    spender: Address,
    value: string,
    deadline = defaultDeadline
): Promise<string> {
    const nonce = await token.nonces(owner);
    const name = await token.name();
    const data = buildData(
        owner, name, tokenVersion, chainId, token.address, spender, nonce, value, deadline
    );
    const signature = await wallet._signTypedData(data.domain, data.types, data.value);
    const { v, r, s } = splitSignature(signature);
    const permitCall = token.interface.encodeFunctionData(
        'permit', [owner, spender, value, deadline, v, r, s]
    );
    return cutSelector(permitCall);
}
