import {EIP712TypedData} from "../../../model/eip712.model";
import {setN} from "../../../utils/limit-order.utils";
import {
    LimitOrderProtocolFacade
} from "../../../limit-order-protocol.facade";
import {ProviderConnector} from "../../../connector/provider.connector";
import {AbiItem} from "../../../model/abi.model";
import {LimitOrderBuilder} from "../../../limit-order.builder";
import {LimitOrderPredicateBuilder} from "../../../limit-order-predicate.builder";
import {
    ExtensionParamsWithCustomData,
    LimitOrderData,
    LimitOrderWithExtension,
} from "../../../model/limit-order-protocol.model";
import { ethers } from 'hardhat'
import {buildTakerTraits} from "../../../utils/build-taker-traits";
import {Contract} from "ethers";

type Signer = Awaited<ReturnType<typeof ethers.getSigners>>[0];

const testDomainSettings = {
    domainName: '1inch Limit Order Protocol',
    version: '4',
};
export async function signOrder(
    typedData: EIP712TypedData,
    wallet: Signer,
): Promise<string> {
    return await wallet.signTypedData(
        typedData.domain,
        { Order: typedData.types.Order },
        typedData.message
    );
}

export function cutSelector(data: string): string {
    const hexPrefix = '0x';
    return hexPrefix + data.substring(hexPrefix.length + 8);
}

export function ether(num: string): bigint {
    return ethers.parseUnits(num);
}

export function fillWithMakingAmount(amount: bigint): string {
    const result = BigInt(amount) | buildTakerTraits({ makingAmount: true }).traits;
    return `0x${result.toString(16)}`;
}

export function skipMakerPermit (amount: bigint): string {
    return setN(amount, 253, true).toString();
}

export function compactSignature (signature: string): { r: string, vs: string } {
    const sig = ethers.Signature.from(signature);//
    return {
        r: sig.r,
        vs: sig.yParityAndS,
    };
}

export function getProviderConnector(signer: Signer): ProviderConnector {
    return {
        signTypedData(
            _: string,
            typedData: EIP712TypedData,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _typedDataHash: string
        ): Promise<string> {
            return signOrder(typedData, signer)
        },
        contractEncodeABI(
            abi: AbiItem[],
            _: string | null,
            methodName: string,
            methodParams: unknown[]
        ): string {
            const iface = new ethers.Interface(abi);
            return iface.encodeFunctionData(methodName, methodParams);
        },
        ethCall(contractAddress: string, callData: string): Promise<string> {
            const provider = ethers.provider;
            return provider.call({
                to: contractAddress,
                data: callData,
            });
        }
    } as ProviderConnector;
}

export function getOrderFacade(
    contractAddress: string,
    chainId: bigint,
    wallet: Signer,
): LimitOrderProtocolFacade {
    const takerProviderConnector = getProviderConnector(wallet);
    return new LimitOrderProtocolFacade(
        contractAddress,
        Number(chainId),
        takerProviderConnector
    );
}

export function getPredicateBuilder(
    contractAddress: string,
    chainId: bigint,
    wallet: Signer,
): LimitOrderPredicateBuilder {
    const facade = getOrderFacade(contractAddress, chainId, wallet);
    return new LimitOrderPredicateBuilder(facade);
}

export function getOrderBuilder(
    wallet: Signer
): LimitOrderBuilder {
    const makerProviderConnector = getProviderConnector(wallet);

    return new LimitOrderBuilder(
        makerProviderConnector,
        testDomainSettings
    );
}

type FacadeTxMethods = Pick<
    LimitOrderProtocolFacade,
    'fillLimitOrder' | 'fillLimitOrderArgs' | 'permitAndCall' | 'increaseEpoch' | 'cancelLimitOrder'
>;
type AllowedFacadeTxMethods = keyof FacadeTxMethods;

export async function getFacadeTx<M extends AllowedFacadeTxMethods>(
    method: M,
    txParams: Parameters<FacadeTxMethods[M]>,
    filler: Signer,
    chainId: bigint,
    swap: Contract,
    ) {
    const facade = getOrderFacade(await swap.getAddress(), chainId, filler);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callData = (facade as any)[method](...txParams);
    return filler.sendTransaction({
        to: await swap.getAddress(),
        data: callData
    });
}

// export function getFacadeViewCall<M extends Al

type FacadeViewCallMethods = Pick<
    LimitOrderProtocolFacade,
    'epoch' |
    'remainingInvalidatorForOrder' |
    'checkPredicate' |
    'rawRemainingInvalidatorForOrder' |
    'orderHash'
>;
type AllowedFacadeViewCallMethods = keyof FacadeViewCallMethods;

export async function getFacadeViewCall<M extends AllowedFacadeViewCallMethods>(
    method: M,
    txParams: Parameters<FacadeViewCallMethods[M]>,
    filler: Signer,
    chainId: bigint,
    swap: Contract,
): Promise<ReturnType<FacadeViewCallMethods[M]>> {
    const facade = getOrderFacade(await swap.getAddress(), chainId, filler);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (facade as any)[method](...txParams);
}

export async function getSignedOrder(
    wallet: Signer,
    orderData: Omit<LimitOrderData, 'salt'>,
    {
        chainId,
        verifyingContract,
    }: { chainId: bigint, verifyingContract: string },
    extensionData?: ExtensionParamsWithCustomData,
): Promise<{ order: LimitOrderWithExtension, signature: string, orderHash: string }> {
    const builder = getOrderBuilder(wallet);
    const order = builder.buildLimitOrder({
        ...orderData,
        salt: '1',
    }, extensionData);

    const typedData = builder.buildLimitOrderTypedData(
        order, chainId, verifyingContract
    );

    const signature = await builder.buildOrderSignature(await wallet.getAddress(), typedData);
    const orderHash = builder.buildLimitOrderHash(typedData);

    return {
        order: order,
        signature,
        orderHash,
    }
}
