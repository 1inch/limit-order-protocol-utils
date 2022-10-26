import { PrivateKeyProviderConnector } from "../connector/private-key-provider.connector";
import { LimitOrderPredicateBuilder } from "../limit-order-predicate.builder";
import { LimitOrderProtocolFacade } from "../limit-order-protocol.facade";
import { LimitOrderBuilder } from "../limit-order.builder";
import { ChainId } from "../model/limit-order-protocol.model";
import { contractAddresses, rpcUrls } from "../utils/limit-order-rfq.const";
import Web3 from "web3";
import { Erc20Facade } from "../erc20.facade";


export function mocksForChain(chainId: ChainId, contractAddressOverride?: string) {
    const contractAddress = contractAddressOverride || contractAddresses[chainId];
    const web3 = new Web3(rpcUrls[chainId]);
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

    return { facade, erc20Facade, limitOrderPredicateBuilder, limitOrderBuilder, contractAddress, providerConnector };
}
