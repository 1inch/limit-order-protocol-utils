import { LimitOrderPredicateBuilder } from './limit-order-predicate.builder';
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
import { mocksForChain } from './test/helpers';


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

// eslint-disable-next-line max-len
const P2P_PREDICATE = `0xbf15fcd8000000000000000000000000303389f541ff2d620e42832f180a08e767b28e10000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000242cc2878d006373bd84000000000000016e359d196494f7c172ca91c7b9ebbbed62a5f10a00000000000000000000000000000000000000000000000000000000`;
const P2P_AST = {
    name: "arbitraryStaticCall",
    type: "function",
    meta: {
        source: "0x1111111254eeb25477b68fb85ed929f73a960582"
    },
    args: {
        target: {
            bytes: "0x303389f541FF2D620E42832F180A08E767B28E10",
            meta: {
                source: "0x1111111254eeb25477b68fb85ed929f73a960582"
            },
            type: "bytes"
        },
        data: {
            name: "timestampBelowAndNonceEquals",
            type: "function",
            meta: {
                source: "0x303389f541ff2d620e42832f180a08e767b28e10"
            },
            args: {
                address: {
                    bytes: "0x6e359d196494f7c172ca91c7b9ebbbed62a5f10a",
                    meta: {
                        source: "0x303389f541ff2d620e42832f180a08e767b28e10"
                    },
                    type: "bytes"
                },
                nonce: {
                    bytes: "0",
                    meta: {
                        source: "0x303389f541ff2d620e42832f180a08e767b28e10"
                    },
                    type: "bytes"
                },
                series: {
                    bytes: "1",
                    meta: {
                        source: "0x303389f541ff2d620e42832f180a08e767b28e10"
                    },
                    type: "bytes"
                },
                timestamp: {
                    bytes: "1668529540",
                    meta: {
                        source: "0x303389f541ff2d620e42832f180a08e767b28e10"
                    },
                    type: "bytes"
                }
            },
        },
    },
}

describe("LimitOrderPredicateDecoder", () => {
    const chainId = ChainId.etherumMainnet;
    const limitOrderPredicateDecoder = new LimitOrderPredicateDecoder(chainId);

    let predicateBuilder: LimitOrderPredicateBuilder;
    // let erc20Facade: Erc20Facade;
    let seriesNonceManagerContractAddress: string;
    let seriesNonceManagerPredicateBuilder: SeriesNonceManagerPredicateBuilder;

    describe("AST parsing", () => {

        it("simple gasless predicate", () => {
            expect(limitOrderPredicateDecoder.decode(GASLESS_PREDICATE)).toMatchObject(GASLESS_AST);
        });

        it("p2p with series-nonce-manager call", () => {
            expect(limitOrderPredicateDecoder.decode(P2P_PREDICATE)).toMatchObject(P2P_AST);
        });

    });

    describe("search util", () => {


        beforeEach(() => {
            const mocks = mocksForChain(chainId);
            // erc20Facade = mocks.erc20Facade;
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
