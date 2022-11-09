
import { SeriesNonceManagerFacade } from "./series-nonce-manager.facade";
import { ChainId } from "./model/limit-order-protocol.model";
import { BETA_CONTRACT_ADDRESSES, mocksForChain } from "./test/helpers";
import { LimitOrderSeries } from "./model/series-nonce-manager.model";
import { ProviderConnector } from "./connector/provider.connector";


describe("SeriesNonceManagerFacade", () => {
    const walletAddress = '0xfb3c7eb936caa12b5a884d612393969a557d4307';
    let seriesNonceManagerContractAddress: string;

    let seriesNonceManagerFacade: SeriesNonceManagerFacade;
    let providerConnector: ProviderConnector;

    beforeEach(() => {
        const chainId = ChainId.etherumMainnet;
        
        const mocks = mocksForChain(chainId, BETA_CONTRACT_ADDRESSES[chainId]);
        seriesNonceManagerFacade = mocks.seriesNonceManagerFacade;
        providerConnector = mocks.providerConnector;
        seriesNonceManagerContractAddress = mocks.seriesNonceManagerContractAddress;
    });

    it("nonce", () => {
        expect(
            seriesNonceManagerFacade.nonce(LimitOrderSeries.P2Pv3, walletAddress),
        ).toMatchSnapshot();
    });

    it("advanceNonce", () => {
        expect(
            seriesNonceManagerFacade.advanceNonce(LimitOrderSeries.P2Pv3, 3),
        ).toMatchSnapshot();
    });

    it("increaseNonce", () => {
        expect(
            seriesNonceManagerFacade.increaseNonce(LimitOrderSeries.P2Pv3),
        ).toMatchSnapshot();
    });

    it("nonceEquals", async () => {
        expect(
            seriesNonceManagerFacade.nonceEquals(LimitOrderSeries.P2Pv3, walletAddress, 101),
        ).toMatchSnapshot();
    });

    describe("web3 calls", () => {
        it("nonce", async () => {
            const nonce = await seriesNonceManagerFacade.getNonce(LimitOrderSeries.P2Pv2, walletAddress);
    
            expect(nonce).toBe(4n);
        });

        it("nonceEquals call", async () => {
            const calldata = seriesNonceManagerFacade.nonceEquals(LimitOrderSeries.P2Pv2, walletAddress, 4);

            const result = await providerConnector.ethCall(seriesNonceManagerContractAddress, calldata);
            expect(result).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
        });
    });
});