import { utils } from 'ethers'
import {EIP712TypedData} from "../../../model/eip712.model";
import {setN} from "../../../utils/limit-order.utils";
import {LimitOrderProtocolFacade} from "../../../limit-order-protocol.facade";
import {ProviderConnector} from "../../../connector/provider.connector";
import {AbiItem} from "../../../model/abi.model";
import {LimitOrderBuilder} from "../../../limit-order.builder";
import {LimitOrderPredicateBuilder} from "../../../limit-order-predicate.builder";

const testDomainSettings = { domainName: '1inch Limit Order Protocol', version: '4' };
export async function signOrder(typedData: EIP712TypedData, wallet): Promise<string> {
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

export function ether(num) {
    return utils.parseUnits(num);
}

export function fillWithMakingAmount(amount: bigint): string {
    return setN(amount, 255, true).toString();
}

export function skipMakerPermit (amount: bigint): string {
    return setN(amount, 253, true).toString();
}

export function compactSignature (signature: string) {
    const sig = utils.splitSignature(signature);
    return {
        r: sig.r,
        vs: sig._vs,
    };
}

export function getProviderConnector(signer): ProviderConnector {
    return {
        signTypedData(
            _: string,
            typedData: EIP712TypedData,
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
    wallet
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
    wallet
): LimitOrderPredicateBuilder {
    const facade = getOrderFacade(contractAddress, chainId, wallet);
    return new LimitOrderPredicateBuilder(facade);
}

export function getOrderBuilder(contractAddress: string, wallet): LimitOrderBuilder {
    const makerProviderConnector = getProviderConnector(wallet);

    return new LimitOrderBuilder(
        contractAddress,
        makerProviderConnector,
        testDomainSettings
    );
}
