import { LimitOrderPredicateBuilder } from "../limit-order-predicate.builder";
import { ZX } from "../limit-order-protocol.const";
import { ChainId } from "../model/limit-order-protocol.model";
import { mocksForChain } from "../test/helpers";
import {
    packSkipPermitAndThresholdAmount,
    UINT48_BITMASK,
    unpackTimestampAndNoncePredicate,
} from "./limit-order.utils";

describe("limit-order.utils", () => {
    const walletAddress = '0xfb3c7eb936cAA12B5A884d612393969A557d4307';

    let limitOrderPredicateBuilder: LimitOrderPredicateBuilder;


    beforeAll(() => {
        const chainId = ChainId.etherumMainnet;
        
        const mocks = mocksForChain(chainId);
        limitOrderPredicateBuilder = mocks.limitOrderPredicateBuilder;

        jest.spyOn(console, 'error').mockImplementation();
    });

    describe("unpackTimestampAndNoncePredicate", () => {
        it("call with calldata of predicate", () => {
            expect(
                unpackTimestampAndNoncePredicate('608d1a4600000000000efb3c7eb936caa12b5a884d612393969a557d4307')
            ).toMatchObject({
                address: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
                nonce: 14n,
                timestamp: 1619860038n,
            })
        });

        it("call with ZX calldata", () => {
            expect(
                unpackTimestampAndNoncePredicate('0x608d1a4600000000000efb3c7eb936caa12b5a884d612393969a557d4307')
            ).toMatchObject({
                address: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
                nonce: 14n,
                timestamp: 1619860038n,
            })
        });

        it("call with complete predicate", () => {
            expect(
                unpackTimestampAndNoncePredicate('0x2cc2878d0000608d1a4600000000000efb3c7eb936caa12b5a884d612393969a557d4307')
            ).toMatchObject({
                address: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
                nonce: 14n,
                timestamp: 1619860038n,
            })
        });

        it("call with wrapping data in predicate", () => {
            expect(
                // eslint-disable-next-line max-len
                unpackTimestampAndNoncePredicate('0xFFFFFFFFFFFFFFFF2cc2878d0000608d1a4600000000000efb3c7eb936caa12b5a884d612393969a557d4307FFFFFFFFFFFFFFFF')
            ).toMatchObject({
                address: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
                nonce: 14n,
                timestamp: 1619860038n,
            })
        });

        it("call with complex order predicate", () => {
            const nonce = 14n;
            const timestamp = 1619860038n;
            const { and, eq, timestampBelowAndNonceEquals, arbitraryStaticCall } = limitOrderPredicateBuilder;
            const predicate = and(
                eq(
                    '0',
                    arbitraryStaticCall(
                        walletAddress,
                        ZX,
                    )
                ),
                timestampBelowAndNonceEquals(timestamp, nonce, walletAddress),
                eq(
                    '0',
                    arbitraryStaticCall(
                        walletAddress,
                        ZX,
                    )
                ),
            );

            expect(
                unpackTimestampAndNoncePredicate(predicate)
            ).toMatchObject({
                address: walletAddress.toLowerCase(),
                nonce,
                timestamp,
            })
        });

        it("maximum possible values", () => {
            const predicate = limitOrderPredicateBuilder.timestampBelowAndNonceEquals(
                UINT48_BITMASK,
                UINT48_BITMASK,
                walletAddress,
            )

            expect(
                unpackTimestampAndNoncePredicate(predicate)
            ).toMatchObject({
                address: walletAddress.toLowerCase(),
                nonce: UINT48_BITMASK,
                timestamp: UINT48_BITMASK,
            })
        });
    });


    describe("packSkipPermitAndThresholdAmount when thresholdAmount is hex string", () => {
        const thresholdAmount = BigInt(2)**BigInt(254);
        const skipPermit = (BigInt(1) << BigInt(255));
        it("with skip", () => {
            expect(
                packSkipPermitAndThresholdAmount(ZX + thresholdAmount.toString(16), true)
            ).toBe(
                ZX + (thresholdAmount + skipPermit).toString(16),
            );
        });
    
        it("without skip", () => {
            expect(
                packSkipPermitAndThresholdAmount(ZX + thresholdAmount.toString(16), false)
            ).toBe((ZX + thresholdAmount.toString(16)));
        });
    });

    describe("packSkipPermitAndThresholdAmount when thresholdAmount is 10 radix string", () => {
        const thresholdAmount = BigInt(2)**BigInt(254);
        const skipPermit = (BigInt(1) << BigInt(255));
        it("with skip", () => {
            expect(
                packSkipPermitAndThresholdAmount(thresholdAmount.toString(), true)
            ).toBe(
                ZX + (thresholdAmount + skipPermit).toString(16),
            );
        });

        it("without skip", () => {
            expect(
                packSkipPermitAndThresholdAmount(thresholdAmount.toString(), false)
            ).toBe((ZX + thresholdAmount.toString(16)));
        });
    });

});
