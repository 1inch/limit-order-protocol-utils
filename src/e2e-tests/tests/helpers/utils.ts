import { utils } from 'ethers'
import {EIP712TypedData, ORDER_STRUCTURE} from "../../../model/eip712.model";
import {setN} from "../../../utils/limit-order.utils";
import {
    LimitOrderProtocolFacade
} from "../../../limit-order-protocol.facade";
import {ProviderConnector} from "../../../connector/provider.connector";
import {AbiItem} from "../../../model/abi.model";
import {LimitOrderBuilder} from "../../../limit-order.builder";
import {LimitOrderPredicateBuilder} from "../../../limit-order-predicate.builder";
import {BigNumber} from "@ethersproject/bignumber";
import {
    SignerWithAddress,
} from "@1inch/solidity-utils/node_modules/@nomiclabs/hardhat-ethers/signers";
import {
    ExtensionParamsWithCustomData,
    LimitOrderData,
    LimitOrderWithExtension,
} from "../../../model/limit-order-protocol.model";

const testDomainSettings = {
    domainName: '1inch Limit Order Protocol',
    version: '4',
};
export async function signOrder(
    typedData: EIP712TypedData,
    wallet: SignerWithAddress
): Promise<string> {
    return await wallet._signTypedData(
        typedData.domain,
        { Order: typedData.types.Order },
        typedData.message
    );
}

export function cutSelector(data: string): string {
    const hexPrefix = '0x';
    return hexPrefix + data.substring(hexPrefix.length + 8);
}

export function ether(num: string): BigNumber {
    return utils.parseUnits(num);
}

export function fillWithMakingAmount(amount: bigint): string {
    return setN(amount, 255, true).toString();
}

export function skipMakerPermit (amount: bigint): string {
    return setN(amount, 253, true).toString();
}

export function compactSignature (signature: string): { r: string, vs: string } {
    const sig = utils.splitSignature(signature);
    return {
        r: sig.r,
        vs: sig._vs,
    };
}

export function getProviderConnector(signer: SignerWithAddress): ProviderConnector {
    return {
        signTypedData(
            _: string,
            typedData: EIP712TypedData,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            typedDataHash: string
        ): Promise<string> {
            return signOrder(typedData, signer)
        },
        contractEncodeABI(
            abi: AbiItem[],
            _: string | null,
            methodName: string,
            methodParams: unknown[]
        ): string {
            const iface = new utils.Interface(abi);
            return iface.encodeFunctionData(methodName, methodParams);
        }
    } as ProviderConnector;
}

export function getOrderFacade(
    contractAddress: string,
    chainId: number,
    wallet: SignerWithAddress,
): LimitOrderProtocolFacade {
    const takerProviderConnector = getProviderConnector(wallet);
    return new LimitOrderProtocolFacade(
        contractAddress,
        +chainId,
        takerProviderConnector
    );
}

export function getPredicateBuilder(
    contractAddress: string,
    chainId: number,
    wallet: SignerWithAddress,
): LimitOrderPredicateBuilder {
    const facade = getOrderFacade(contractAddress, chainId, wallet);
    return new LimitOrderPredicateBuilder(facade);
}

export function getOrderBuilder(
    wallet: SignerWithAddress
): LimitOrderBuilder {
    const makerProviderConnector = getProviderConnector(wallet);

    return new LimitOrderBuilder(
        makerProviderConnector,
        testDomainSettings
    );
}

type FacadeFillMethods = Pick<
    LimitOrderProtocolFacade,
    'fillLimitOrder' | 'fillLimitOrderExt' | 'fillOrderToWithPermit'
>;
type AllowedFillMethods = keyof FacadeFillMethods;

export function getFillTx<M extends AllowedFillMethods>(
    method: M,
    txParams: Parameters<FacadeFillMethods[M]>[0],
    filler: SignerWithAddress,
    chainId: number,
    swap,
    ) {
    const facade = getOrderFacade(swap.address, chainId, filler);
    const callData = (facade as FacadeFillMethods)[method](txParams as never);
    return filler.sendTransaction({
        to: swap.address,
        data: callData
    });
}

export async function getSignedOrder(
    wallet: SignerWithAddress,
    orderData: LimitOrderData,
    {
        chainId,
        verifyingContract,
    }: { chainId: number, verifyingContract: string },
    extensionData?: ExtensionParamsWithCustomData,
): Promise<{ order: LimitOrderWithExtension, signature: string }> {
    const builder = getOrderBuilder(wallet);
    const order = builder.buildLimitOrder(orderData, extensionData);
    const signature = await builder.buildTypedDataAndSign(
        order.order, chainId, verifyingContract, wallet.address
    );

    return {
        order: order,
        signature,
    }
}
