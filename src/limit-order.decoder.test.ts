import { ZX } from './limit-order-protocol.const';
import { LimitOrderBuilder } from './limit-order.builder';
import {LimitOrderDecoder} from './limit-order.decoder';
import {
    commonMakerTraits,
    difficultMakerTraits,
    extensionWithPermit,
    extensionWithPermitAndPredicate,
    extensionWithPredicate,
    largeInteractions,
    largeResult
} from './test/mocks';

describe('LimitOrderDecoder', () => {

    describe('unpackInteractionsV3', () => {
        describe("unpackInteractionsV3", () => {
            it("should unpack", () => {
                const interactions = LimitOrderDecoder.unpackInteractionsV3(largeResult.offsets, largeResult.interactions);
                expect(interactions).toMatchObject(largeInteractions);
            })
        })
    });

    describe('unpackInteractions', () => {
        describe("unpackInteractions", () => {
            it("should unpack predicate", () => {
                const interactions = LimitOrderDecoder.unpackExtension(extensionWithPredicate.extension);
                expect(interactions).toMatchObject(extensionWithPredicate.result);
            });

            it("should unpack permit", () => {
                const interactions = LimitOrderDecoder.unpackExtension(extensionWithPermit.extension);
                expect(interactions).toMatchObject(extensionWithPermit.result);
            });

            it("should unpack permit & predicate", () => {
                const interactions = LimitOrderDecoder.unpackExtension(extensionWithPermitAndPredicate.extension);
                expect(interactions).toMatchObject(extensionWithPermitAndPredicate.result);
            });

            it("should unpack permit & predicate", () => {
                const interactions = LimitOrderDecoder.unpackExtension(extensionWithPermitAndPredicate.extension);
                expect(interactions).toMatchObject(extensionWithPermitAndPredicate.result);
            });
        })
    });

    describe('unpackMakerTraits', () => {
        it('should unpack default maker traits', () => {
            expect(LimitOrderDecoder.unpackMakerTraits(commonMakerTraits.hex)).toMatchObject(commonMakerTraits.result)
        });

        it('should unpack with allowedSender and expiry, nonce, series', () => {
            expect(LimitOrderDecoder.unpackMakerTraits(difficultMakerTraits.hex)).toMatchObject(difficultMakerTraits.result)
        });
    });

    describe("unpackStaticCalls", () => {
        const offsets = '14388460379039638487364';
        // eslint-disable-next-line max-len
        const data = '0x6fe7b0ba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c4bf15fcd80000000000000000000000002dadf9264db7eb9e24470a2e6c73efbc4bdf01aa0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004462534ddf0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000401394cd75d731e07658203fff34722a68316fca000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000063592c2b00000000000000000000000000000000000000000000000000000000636fd73fca4ece2200000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000124bf15fcd8000000000000000000000000ea8977b0567d353d622add6e5872bf42dd43d07e000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a4331f9d1b000000000000000000000000aed0c38402a5d19df6e4c03f4e2dced6e29c1ee90000000000000000000000005f4ec3df9cbd43714fe2740f5e3616155c5b8419000000000000000000000000000000000000000000000000000000003b02338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

        it("and() data", () => {
            expect(
                LimitOrderDecoder.unpackStaticCalls(offsets, data)
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


            const { offsets, data } = LimitOrderBuilder.joinStaticCalls(source);

            const calls = LimitOrderDecoder.unpackStaticCalls(offsets, data);

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
