import { PrivateKeyProviderConnector } from "../connector/private-key-provider.connector";
import { LimitOrderPredicateBuilder } from "../limit-order-predicate.builder";
import { LimitOrderProtocolFacade } from "../limit-order-protocol.facade";
import { LimitOrderBuilder } from "../limit-order.builder";
import { ChainId } from "../model/limit-order-protocol.model";
import { rpcUrls } from "../utils/limit-order-rfq.const";
import Web3 from "web3";
import { Erc20Facade } from "../erc20.facade";
import { SeriesNonceManagerFacade } from "../series-nonce-manager.facade";
import { seriesNonceManagerContractAddresses } from "../series-nonce-manager.const";
import { SeriesNonceManagerPredicateBuilder } from "../series-nonce-manager-predicate.builder";
import { limitOrderProtocolAddresses } from "../limit-order-protocol.const";


export function mocksForChain(
    chainId: ChainId,
    contractAddressOverride?: string,
    seriesNonceManagerContractAddressOverride?: string,
) {
    const contractAddress = contractAddressOverride || limitOrderProtocolAddresses[chainId];
    const seriesNonceManagerContractAddress = seriesNonceManagerContractAddressOverride || seriesNonceManagerContractAddresses[chainId];
    const web3Provider = new Web3.providers.HttpProvider(
        rpcUrls[chainId],
        { headers: [{ name: 'auth-key', value: process.env.AUTHKEY || '' }] }
    );
    const web3 = new Web3(web3Provider);
    const privateKey = '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc';

    const providerConnector = new PrivateKeyProviderConnector(privateKey, web3);
    const facade = new LimitOrderProtocolFacade(
        contractAddress,
        chainId,
        providerConnector,
    );
    const limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(facade);

    const limitOrderBuilder = new LimitOrderBuilder(
        contractAddress,
        chainId,
        providerConnector
    );

    const erc20Facade = new Erc20Facade(providerConnector);

    const seriesNonceManagerFacade = new SeriesNonceManagerFacade(
        seriesNonceManagerContractAddress,
        chainId,
        providerConnector,
    );
    const seriesNonceManagerPredicateBuilder = new SeriesNonceManagerPredicateBuilder(seriesNonceManagerFacade);

    return {
        facade,
        erc20Facade,
        limitOrderPredicateBuilder,
        limitOrderBuilder,
        seriesNonceManagerFacade,
        seriesNonceManagerPredicateBuilder,
        contractAddress,
        seriesNonceManagerContractAddress,
        providerConnector,
    };
}

export const BETA_CONTRACT_ADDRESSES = {
    // V3 prerelease
    [ChainId.etherumMainnet]: '0x9b934b33fef7a899f502bc191e820ae655797ed3',
    [ChainId.auroraMainnet]: '0x8266c553f269b2eEb2370539193bCD0Eff8cC2De'.toLowerCase(),
}
