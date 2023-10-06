import {
    LimitOrderPredicateDecoder,
    PredicateAstArguments,
    PredicateAstNode,
    PredicateAstMatcher,
} from './limit-order-predicate.decoder';
import {
    ChainId
} from './model/limit-order-protocol.model';
import { NonceSeriesV2 } from './model/series-nonce-manager.model';
import { SeriesNonceManagerPredicateBuilder } from './series-nonce-manager-predicate.builder';
import {mocksForV3Chain} from './test/helpers';
import {LimitOrderPredicateV3Builder} from "./limit-order-predicate-v3.builder";
import {LIMIT_ORDER_PROTOCOL_V3_ABI} from "./limit-order-protocol.const";
import {SERIES_NONCE_MANAGER_ABI} from "./series-nonce-manager.const";


// eslint-disable-next-line max-len
const GASLESS_PREDICATE = `0x2cc2878d00006377dffd0000000000001c667c6308d6c9c8ce5bd207f524041f67dbc65e`;
const GASLESS_AST = {
    name: "timestampBelowAndNonceEquals",
    type: "function",
    meta: {
        source: "0x1111111254eeb25477b68fb85ed929f73a960582"
    },
    args: {
        address: {
            bytes: "0x1c667c6308d6c9c8ce5bd207f524041f67dbc65e",
            meta: {
                source: "0x1111111254eeb25477b68fb85ed929f73a960582"
            },
            type: "bytes"
        },
        nonce: {
            bytes: "0",
            meta: {
                source: "0x1111111254eeb25477b68fb85ed929f73a960582"
            },
            type: "bytes"
        },
        timestamp: {
            bytes: "1668800509",
            meta: {
                source: "0x1111111254eeb25477b68fb85ed929f73a960582"
            },
            type: "bytes"
        }
    },
};

describe("LimitOrderPredicateDecoder", () => {
    const chainId = ChainId.etherumMainnet;
    const limitOrderPredicateDecoder = new LimitOrderPredicateDecoder(
        chainId,
        LIMIT_ORDER_PROTOCOL_V3_ABI,
        SERIES_NONCE_MANAGER_ABI,
    );

    let predicateBuilder: LimitOrderPredicateV3Builder;
    // let erc20Facade: Erc20Facade;
    let seriesNonceManagerContractAddress: string;
    let seriesNonceManagerPredicateBuilder: SeriesNonceManagerPredicateBuilder;

    describe("AST parsing", () => {

        it("simple gasless predicate", () => {
            expect(limitOrderPredicateDecoder.decode(GASLESS_PREDICATE)).toMatchObject(GASLESS_AST);
        });

    });

    describe("search util", () => {
        beforeEach(() => {
            const mocks = mocksForV3Chain(chainId);
            predicateBuilder = mocks.limitOrderPredicateBuilder;
            seriesNonceManagerPredicateBuilder = mocks.seriesNonceManagerPredicateBuilder;
            seriesNonceManagerContractAddress = mocks.seriesNonceManagerContractAddress;
        });

        it("findFirstDFS", () => {
            const address = '0x6e359d196494f7c172ca91c7b9ebbbed62a5f10a';
            const { and, or, timestampBelowAndNonceEquals, arbitraryStaticCall, nonce, nonceEquals, eq } = predicateBuilder
            const predicate = or(
                and(
                    timestampBelowAndNonceEquals(1, 1, address),

                ),
                and(
                    eq(
                        '2',
                        nonce(address),
                    ),
                    nonceEquals(address, 3),
                    timestampBelowAndNonceEquals(2, 4, address),
                ),
                and(
                    arbitraryStaticCall(
                        seriesNonceManagerContractAddress,
                        seriesNonceManagerPredicateBuilder.timestampBelowAndNonceEquals(
                            NonceSeriesV2.LimitOrderV3,
                            3,
                            5,
                            address,
                        ),
                    ),
                    nonceEquals(address, 6),
                ),
            );

            const ast = limitOrderPredicateDecoder.decode(predicate);

            const timestampBelowAndNonceEqualsMatcher: PredicateAstMatcher = (node) => (
                node.type === "function"
                    && 'name' in node
                    && node.name === 'timestampBelowAndNonceEquals'
            );

            expect(limitOrderPredicateDecoder.findFirstDFS(ast, timestampBelowAndNonceEqualsMatcher)).toMatchObject({
                name: "timestampBelowAndNonceEquals",
                type: "function",
                meta: {
                    source: "0x1111111254eeb25477b68fb85ed929f73a960582"
                },
                args: {
                    address: {
                        bytes: address,
                    },
                    nonce: {
                        bytes: '1',
                    },
                    timestamp: {
                        bytes: '1',
                    },
                },
            });

            const anyNonceMatcher: PredicateAstMatcher = (node) => (
                node.type === "function"
                    && 'name' in node
                    && ['nonce', 'nonceEquals'].includes(node.name as string)
            );

            expect(limitOrderPredicateDecoder.findFirstDFS(ast, anyNonceMatcher)).toMatchObject({
                name: "nonce",
                type: "function",
                meta: {
                    source: "0x1111111254eeb25477b68fb85ed929f73a960582"
                },
                args: {
                    makerAddress: {
                        bytes: "0x6e359D196494F7C172CA91c7B9eBBBed62a5F10A",
                    },
                },
            });

            const arbitraryStaticCallMatcher: PredicateAstMatcher = (node) => {
                if (node.type !== "function" || node.name !== 'arbitraryStaticCall') return false;

                const target = (node.args as PredicateAstArguments)["target"]["bytes"];
                return target.toLowerCase() === seriesNonceManagerContractAddress.toLowerCase();
            };

            expect(
                limitOrderPredicateDecoder.findFirstDFS(
                    limitOrderPredicateDecoder.findFirstDFS(ast, arbitraryStaticCallMatcher) as PredicateAstNode,
                    timestampBelowAndNonceEqualsMatcher,
                )
            ).toMatchObject({
                name: "timestampBelowAndNonceEquals",
                type: "function",
                meta: {
                    source: seriesNonceManagerContractAddress,
                },
                args: {
                    address: {
                        bytes: address,
                    },
                    nonce: {
                        bytes: '5',
                    },
                    timestamp: {
                        bytes: '3',
                    },
                },
            });
        })
    })
});
