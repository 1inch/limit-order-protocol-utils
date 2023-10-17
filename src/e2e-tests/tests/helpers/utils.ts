import { utils } from 'ethers'
import {EIP712TypedData} from "../../../model/eip712.model";
import {setN, trim0x} from "../../../utils/limit-order.utils";
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
import { ethers } from 'hardhat'
import {solidityPack} from 'ethers/lib/utils';

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

const TakerTraitsConstants = {
    _MAKER_AMOUNT_FLAG: BigInt(1) << BigInt(255),
    _UNWRAP_WETH_FLAG: BigInt(1) << BigInt(254),
    _SKIP_ORDER_PERMIT_FLAG: BigInt(1) << BigInt(253),
    _USE_PERMIT2_FLAG: BigInt(1) << BigInt(252),
    _ARGS_HAS_TARGET: BigInt(1) << BigInt(251),

    _ARGS_EXTENSION_LENGTH_OFFSET: BigInt(224),
    _ARGS_EXTENSION_LENGTH_MASK: 0xffffff,
    _ARGS_INTERACTION_LENGTH_OFFSET: BigInt(200),
    _ARGS_INTERACTION_LENGTH_MASK: 0xffffff,
};

export function buildTakerTraits({
                                     makingAmount = false,
                                     unwrapWeth = false,
                                     skipMakerPermit = false,
                                     usePermit2 = false,
                                     target = '0x',
                                     extension = '0x',
                                     interaction = '0x',
                                     minReturn = BigInt(0),
                                 } = {}): { traits: bigint, args: string } {
    return {
        traits: BigInt(minReturn) | (
            (makingAmount ? TakerTraitsConstants._MAKER_AMOUNT_FLAG : BigInt(0)) |
            (unwrapWeth ? TakerTraitsConstants._UNWRAP_WETH_FLAG : BigInt(0)) |
            (skipMakerPermit ? TakerTraitsConstants._SKIP_ORDER_PERMIT_FLAG : BigInt(0)) |
            (usePermit2 ? TakerTraitsConstants._USE_PERMIT2_FLAG : BigInt(0)) |
            (trim0x(target).length > 0 ? TakerTraitsConstants._ARGS_HAS_TARGET : BigInt(0)) |
            (
                BigInt(trim0x(extension).length / 2)
                << TakerTraitsConstants._ARGS_EXTENSION_LENGTH_OFFSET
            ) |
            (
                BigInt(trim0x(interaction).length / 2)
                << TakerTraitsConstants._ARGS_INTERACTION_LENGTH_OFFSET
            )
        ),
        args: solidityPack(
            ['bytes', 'bytes', 'bytes'],
            [target, extension, interaction],
        ),
    };
}

export function fillWithMakingAmount(amount: bigint): string {
    const result = BigInt(amount) | buildTakerTraits({ makingAmount: true }).traits;
    return `0x${result.toString(16)}`;
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

type FacadeTxMethods = Pick<
    LimitOrderProtocolFacade,
    'fillLimitOrder' | 'fillLimitOrderArgs' | 'permitAndCall' | 'increaseEpoch' | 'cancelLimitOrder'
>;
type AllowedFacadeTxMethods = keyof FacadeTxMethods;

export function getFacadeTx<M extends AllowedFacadeTxMethods>(
    method: M,
    txParams: Parameters<FacadeTxMethods[M]>,
    filler: SignerWithAddress,
    chainId: number,
    swap,
    ) {
    const facade = getOrderFacade(swap.address, chainId, filler);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callData = (facade as any)[method](...txParams);
    return filler.sendTransaction({
        to: swap.address,
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

export function getFacadeViewCall<M extends AllowedFacadeViewCallMethods>(
    method: M,
    txParams: Parameters<FacadeViewCallMethods[M]>,
    filler: SignerWithAddress,
    chainId: number,
    swap,
): ReturnType<FacadeViewCallMethods[M]> {
    const facade = getOrderFacade(swap.address, chainId, filler);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (facade as any)[method](...txParams);
}

export async function getSignedOrder(
    wallet: SignerWithAddress,
    orderData: Omit<LimitOrderData, 'salt'>,
    {
        chainId,
        verifyingContract,
    }: { chainId: number, verifyingContract: string },
    extensionData?: ExtensionParamsWithCustomData,
): Promise<{ order: LimitOrderWithExtension, signature: string, orderHash: string }> {
    const builder = getOrderBuilder(wallet);
    const order = builder.buildLimitOrder({
        ...orderData,
        salt: '1',
    }, extensionData);

    const typedData = builder.buildLimitOrderTypedData(
        order.order, chainId, verifyingContract
    );

    const signature = await builder.buildOrderSignature(wallet.address, typedData);
    const orderHash = builder.buildLimitOrderHash(typedData);

    return {
        order: order,
        signature,
        orderHash,
    }
}
