import { unpackTimestampAndNoncePredicate } from "./limit-order.utils";

describe("limit-order.utils", () => {
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

        it("call with orders predicate", () => {
            expect(
                // eslint-disable-next-line max-len
                unpackTimestampAndNoncePredicate('0xFFFFFFFFFFFFFFFF2cc2878d0000608d1a4600000000000efb3c7eb936caa12b5a884d612393969a557d4307FFFFFFFFFFFFFFFF')
            ).toMatchObject({
                address: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
                nonce: 14n,
                timestamp: 1619860038n,
            })
        });
    });
});
