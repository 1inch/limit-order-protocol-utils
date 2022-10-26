import { packInteractions, unpackInteractions } from "./helpers";

/* eslint-disable max-len */
const largeInteractions = {
    getMakingAmount: '0x20b83f2d000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000001b1ae4d6e2ef500000',
    getTakingAmount: '0x7e2d2183000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000001b1ae4d6e2ef500000',
    predicate: '0xbfa75143000000000000000000000000000000000000000000000000000000680000004400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000068cf6fc6e3000000000000000000000000f9f0419b7ead1807c257adddd3e2956e8663c3ca000000000000000000000000000000000000000000000000000000000000000163592c2b0000000000000000000000000000000000000000000000000000000073187537000000000000000000000000000000000000000000000000',
    permit: '0x',
    preInteraction: '0x',
    postInteraction: '0x1282d0c06368c40c8d4a4d818d78f258d982437b',
    makerAssetData: '0x',
    takerAssetData: '0x',
}

const largeResult = {
    offsets: '10352619522470710713364872187564076972520391943629426919298352199761920',
    interactions: '0x20b83f2d000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000001b1ae4d6e2ef5000007e2d2183000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000001b1ae4d6e2ef500000bfa75143000000000000000000000000000000000000000000000000000000680000004400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000068cf6fc6e3000000000000000000000000f9f0419b7ead1807c257adddd3e2956e8663c3ca000000000000000000000000000000000000000000000000000000000000000163592c2b00000000000000000000000000000000000000000000000000000000731875370000000000000000000000000000000000000000000000001282d0c06368c40c8d4a4d818d78f258d982437b',
}
/* eslint-enable max-len */

describe("helpers", () => {
    describe("packInteractions", () => {
        it("should pack", () => {
            const { offsets, interactions } = packInteractions(largeInteractions);

            expect(offsets).toBe(largeResult.offsets);
            expect(interactions).toBe(largeResult.interactions);
        })
    });

    describe("unpackInteractions", () => {
        it("should unpack", () => {
            const interactions = unpackInteractions(largeResult.offsets, largeResult.interactions);

            expect(interactions).toMatchObject(largeInteractions);
        })
    })
});