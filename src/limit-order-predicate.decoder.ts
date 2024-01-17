import { ZX } from "./limit-order-protocol.const";
import {
    seriesNonceManagerContractAddresses
} from "./series-nonce-manager.const";
import { FunctionFragment, Interface, Result } from '@ethersproject/abi';

import { ChainId } from "./model/limit-order-protocol.model";
import { Address } from "./model/eth.model";
import { AbiItem } from "./model/abi.model";
import { isIterable, mapObject } from "./utils/helpers";
import { LimitOrderPredicateDecoders } from "./utils/decoders/limit-order-predicate-decoders";
import { BigNumber } from "@ethersproject/bignumber";
import { SeriesNonceManagerDecoders } from "./utils/decoders/series-nonce-manager-decoders";
import { trim0x } from "./utils/limit-order.utils";

type Bytes = string;

export interface PredicateAstNode {
    type: "function" | "bytes",
    name?: string,
    args?: PredicateAstArguments,
    bytes?: Bytes,
    meta: {
        source: Address | null,
    }
}

export type PredicateAstArguments = Record<string, PredicateAstNode> | Array<PredicateAstNode>;

export class DecodableCall {
    constructor(
        readonly calldata: string,
        readonly target: Address,
    ) {}
}

export type DecodableArguments =
    Record<string, DecodableCall | PredicateBytes>
    | Array<DecodableCall | PredicateBytes>;

interface DecodablePredicateAstNode {
    type: PredicateAstNode["type"],
    name?: PredicateAstNode["name"],
    bytes?: PredicateAstNode["bytes"],
    meta: PredicateAstNode["meta"],
    args?: PredicateAstNode["args"] | DecodableArguments,
}

export class PredicateBytes implements DecodablePredicateAstNode {
    readonly meta: DecodablePredicateAstNode["meta"];

    readonly type = "bytes";

    constructor(
        readonly bytes: Bytes,
        source: DecodablePredicateAstNode["meta"]["source"],
    ) {
        this.meta = {
            source,
        }
    }
}

export class PredicateFn implements DecodablePredicateAstNode {
    readonly meta: DecodablePredicateAstNode["meta"];

    readonly type = "function";

    constructor(
        readonly name: NonNullable<DecodablePredicateAstNode["name"]>,
        readonly args: NonNullable<DecodablePredicateAstNode["args"]>,
        source: DecodablePredicateAstNode["meta"]["source"],
    ) {
        this.meta = {
            source,
        }
    }
}

export type ABI = AbiItem[];

/**
 * An ifaceContext.decodeFunctionData result.
 *
 * Object contains arguments by indexed and named keys.
 * Eg:
 *
 * ```
 * solMethod(255, '0xff') // solMethod(uint8 count, bytes data)
 * // ->
 * {
 *     0: 255,
 *     1: '0xff',
 *     count: 255,
 *     data: '0xff',
 * }
 * ```
 */
export type CallArguments = Result | { [key: string]: string | BigNumber };

/**
 * See [CallArguments] for details.
 *
 * @param interfaces access it in case if you want implement arbitraryStaticCall-like method
 */
type Decoder = (
    fn: FunctionFragment,
    data: Required<CallArguments>,
    address: Address,
) => DecodablePredicateAstNode;

/**
 * {
 *     methodName: data => PredicateAstNode,
 * //  or
 *     methodSignature0x: data => PredicateAstNode,
 * }
 */
// https://en.wikipedia.org/wiki/Bounded_quantification#F-bounded_quantification
export type DecodersImplementation<Implementation> = {
    [K in keyof Implementation]: (
        // eslint-disable-next-line @typescript-eslint/ban-types
        Implementation[K] extends Function
        ? Decoder
        : Implementation[K]
    )
}

type DecodableInterfaces<T> = Record<
    Address,
    {
        iface: Interface,
        decoders: DecodersImplementation<T>,
    }
>

type DecodableContracts<T> = Record<
    Address,
    {
        abi: ABI,
        decoders: DecodersImplementation<T>;
    }
>

export type PredicateAstMatcher = (node: PredicateAstNode) => boolean;

export class LimitOrderPredicateDecoder<
    T extends ChainId,
    Decoders extends DecodersImplementation<Decoders>,
> {
    decodableInterfaces:
        DecodableInterfaces<Decoders>
        | DecodableInterfaces<LimitOrderPredicateDecoders>
        | DecodableInterfaces<SeriesNonceManagerDecoders>;

    defaultAddress: string;

    private readonly limitOrderABI: AbiItem[];

    private readonly seriesNonceManagerABI: AbiItem[];

    constructor(
        private readonly contractAddress: Address,
        private readonly chainId: T,
        limitOrderABI: AbiItem[],
        seriesNonceManagerABI: AbiItem[],
        decodableContracts: DecodableContracts<Decoders> = {},
    ) {
        this.limitOrderABI = limitOrderABI;
        this.seriesNonceManagerABI = seriesNonceManagerABI;
        this.defaultAddress = this.contractAddress;

        this.decodableInterfaces = {
            [this.defaultAddress]: {
                iface: new Interface(this.limitOrderABI),
                decoders: new LimitOrderPredicateDecoders(),
            },
            [seriesNonceManagerContractAddresses[this.chainId].toLowerCase()]: {
                iface: new Interface(this.seriesNonceManagerABI),
                decoders: new SeriesNonceManagerDecoders(),
            },

        }

        // User defined decoders
        Object.assign(
            this.decodableInterfaces,
            this.decodableContractsToDecodableInterfaces(decodableContracts),
        );
    }

    decode(calldata: string): PredicateAstNode {
        return this.parseCalldata(calldata, this.defaultAddress);
    }

    findFirstDFS = (
        tree: PredicateAstNode,
        matcher: PredicateAstMatcher,
    ): PredicateAstNode | null => {
        if (matcher(tree)) return tree;

        if (tree.args) {
            const args = isIterable(tree.args)
                ? Array.from(tree.args as ArrayLike<PredicateAstNode>)
                : Object.values(tree.args);

            for (const arg of args) {
                const result = this.findFirstDFS(arg, matcher);

                if (result) return result;
            }
        }

        return null;
    }

    private decodableContractsToDecodableInterfaces(
        decodableContracts: DecodableContracts<Decoders>,
    ): DecodableInterfaces<Decoders> {
        return Object.assign({}, ...Object.entries(decodableContracts).map(
            ([address, { abi, decoders }]) => {
                return [
                    address.toLowerCase(),
                    {
                        iface: new Interface(abi),
                        decoders,
                    }
                ]
            }
        ))
    }

    // eslint-disable-next-line
    private parseCalldata = (calldata: string, address: Address): PredicateAstNode => {
        const selector = calldata.substring(0, 10);
        const decodableIface = this.decodableInterfaces[address];

        if (!decodableIface) return new PredicateBytes(calldata, address);

        let fn: FunctionFragment;
        try {
            fn = decodableIface.iface.getFunction(selector);
        } catch (e) {
            // eslint-disable-next-line max-len
            console.warn(`Tried to decode unknown function with signature ${selector} on ${address}.`);
            return new PredicateBytes(calldata, address);
        }

        const data = decodableIface.iface.decodeFunctionData(fn, calldata);

        type decoderKey = keyof typeof decodableIface.decoders
        const decoder = (
            decodableIface.decoders[fn.name as decoderKey]
            || decodableIface.decoders[selector as decoderKey]
            || decodableIface.decoders[selector.substring(2) as decoderKey]
        ) as Decoder;

        if (!decoder) return new PredicateBytes(calldata, address);


        const decoded = decoder(fn, data, address);
        const result = {
            ...decoded,
        } as PredicateAstNode;

        const { args } = decoded;
        if (args) {
            if (isIterable(args)) {
                result.args = Array.from(args as ArrayLike<PredicateAstNode>).map(this.mapArgs);
            } else {
                result.args = mapObject(
                    args as Record<string, DecodableCall | PredicateBytes>,
                    this.mapArgs,
                );
            }
        }

        return result
    }

    private parseDecodableCall = (call: DecodableCall): PredicateAstNode => {
        return this.parseCalldata(ZX + trim0x(call.calldata), call.target.toLowerCase());
    }

    private mapArgs = (arg: DecodableCall | PredicateAstNode): PredicateAstNode => {
        if (arg instanceof DecodableCall) {
            return this.parseDecodableCall(arg);
        }

        return arg;
    }

}
