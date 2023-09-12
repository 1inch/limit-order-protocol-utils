import { ProviderConnector } from "src/connector/provider.connector";
import { AbiItem } from "src/model/abi.model";
import { ChainId } from "src/model/limit-order-protocol.model";


export abstract class AbstractSmartcontractFacade<ABI_METHODS extends string> {

    abstract ABI: AbiItem[];

    constructor(
        public readonly contractAddress: string,
        public readonly chainId: ChainId | number,
        public readonly providerConnector: ProviderConnector,
    ) {}

    getContractCallData(
        methodName: ABI_METHODS,
        methodParams: unknown[] = []
    ): string {
        return this.providerConnector.contractEncodeABI(
            this.ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }
}
