import { cutSelector } from './utils';
import {Address} from "../../../model/limit-order-protocol.model";
import {Contract, Signature} from "ethers";
import {ethers} from "hardhat";

type Signer = Awaited<ReturnType<typeof ethers.getSigners>>[0];

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
    wallet: Signer,
    token: Contract,
    tokenVersion: string,
    chainId: bigint,
    spender: Address,
    value: string,
    deadline = defaultDeadline
): Promise<string> {
    const nonce = await token.nonces(owner);
    const name = await token.name();
    const data = buildData(
        owner,
        name,
        tokenVersion,
        Number(chainId),
        await token.getAddress(),
        spender,
        nonce,
        value,
        deadline
    );
    const signature = await wallet.signTypedData(data.domain, data.types, data.value);
    const { v, r, s } = Signature.from(signature);
    const permitCall = token.interface.encodeFunctionData(
        'permit', [owner, spender, value, deadline, v, r, s]
    );
    return cutSelector(permitCall);
}
