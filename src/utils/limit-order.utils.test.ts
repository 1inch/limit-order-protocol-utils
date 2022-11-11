import { LimitOrderPredicateBuilder } from "../limit-order-predicate.builder";
import { ZX } from "../limit-order-protocol.const";
import { ChainId } from "../model/limit-order-protocol.model";
import { mocksForChain } from "../test/helpers";
import {
    joinStaticCalls,
    packSkipPermitAndThresholdAmount,
    UINT48_BITMASK,
    unpackStaticCalls,
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


    describe("packSkipPermitAndThresholdAmount", () => {
        const thresholdAmount = BigInt(2)**BigInt(254);
        const skipPermit = (BigInt(1) << BigInt(255));
        it("with skip", () => {
            expect(
                packSkipPermitAndThresholdAmount(thresholdAmount.toString(16), true)
            ).toBe(
                (thresholdAmount + skipPermit).toString(16),
            );
        });
    
        it("without skip", () => {
            expect(
                packSkipPermitAndThresholdAmount(thresholdAmount.toString(16), false)
            ).toBe((thresholdAmount.toString(16)));
        });
    });

    describe("unpackStaticCalls", () => {
        const offsets = '14388460379039638487364';
        // eslint-disable-next-line max-len
        const data = '0x6fe7b0ba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c4bf15fcd80000000000000000000000002dadf9264db7eb9e24470a2e6c73efbc4bdf01aa0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004462534ddf0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000401394cd75d731e07658203fff34722a68316fca000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000063592c2b00000000000000000000000000000000000000000000000000000000636fd73fca4ece2200000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000124bf15fcd8000000000000000000000000ea8977b0567d353d622add6e5872bf42dd43d07e000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a4331f9d1b000000000000000000000000aed0c38402a5d19df6e4c03f4e2dced6e29c1ee90000000000000000000000005f4ec3df9cbd43714fe2740f5e3616155c5b8419000000000000000000000000000000000000000000000000000000003b02338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

        it("and() data", () => {
            expect(
                unpackStaticCalls(offsets, data)
            ).toMatchObject([
                // eslint-disable-next-line max-len
                '6fe7b0ba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c4bf15fcd80000000000000000000000002dadf9264db7eb9e24470a2e6c73efbc4bdf01aa0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004462534ddf0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000401394cd75d731e07658203fff34722a68316fca0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                '63592c2b00000000000000000000000000000000000000000000000000000000636fd73f',
                // eslint-disable-next-line max-len
                'ca4ece2200000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000124bf15fcd8000000000000000000000000ea8977b0567d353d622add6e5872bf42dd43d07e000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a4331f9d1b000000000000000000000000aed0c38402a5d19df6e4c03f4e2dced6e29c1ee90000000000000000000000005f4ec3df9cbd43714fe2740f5e3616155c5b8419000000000000000000000000000000000000000000000000000000003b02338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
            ]);
        });

        it("radnom data", () => {
            const MAX_STRING_SIZE = 2**29-24;
            const REST_STRINGS_LENGTH = 30;
            const source = [
                '0x11',
                '0x2222',
                '0x333333',
                ZX + 'F'.repeat(MAX_STRING_SIZE - REST_STRINGS_LENGTH),
                '0x44444444',
            ];


            const { offsets, data } = joinStaticCalls(source);

            const calls = unpackStaticCalls(offsets, data);

            expect(calls.slice(0, -2)).toMatchObject([
                '11',
                '2222',
                '333333',
            ]);
            expect(calls[3].length).toBe(MAX_STRING_SIZE - REST_STRINGS_LENGTH);
            expect(calls[4]).toBe('44444444');
        })
    
    });
});
