import { ProviderConnector } from "src/connector/provider.connector";
import { ChainId } from "src/model/limit-order-protocol.model";


export abstract class AbstractSmartcontractFacade {
    constructor(
        public readonly contractAddress: string,
        public readonly chainId: ChainId | number,
        public readonly providerConnector: ProviderConnector,
    ) {}
}