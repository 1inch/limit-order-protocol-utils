import { SERIES_NONCE_MANAGER_ABI } from "./series-nonce-manager.const";
import { Nonce } from "./model/limit-order-protocol.model";
import { Series, SeriesNonceManagerMethods } from "./model/series-nonce-manager.model";
import { AbstractSmartcontractFacade } from "./utils/abstract-facade";

export class SeriesNonceManagerFacade extends AbstractSmartcontractFacade {

    nonce(series: Series, makerAddress: string): string {
        return this.getContractCallData(
            SeriesNonceManagerMethods.nonce,
            [series, makerAddress],
        );
    }

    async getNonce(
        series: Series,
        makerAddress: string,
    ): Promise<bigint> {
        const callData = this.getContractCallData(
            SeriesNonceManagerMethods.nonce,
            [
                series,
                makerAddress,
            ],
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .then((nonce) => BigInt(nonce));
    }

    advanceNonce(series: Series, count: Nonce): string {
        return this.getContractCallData(
            SeriesNonceManagerMethods.advanceNonce,
            [series, count],
        );
    }

    increaseNonce(series: Series): string {
        return this.getContractCallData(
            SeriesNonceManagerMethods.increaseNonce,
            [series],
        );
    }

    nonceEquals(
        series: Series,
        makerAddress: string,
        makerNonce: Nonce,
    ): string {
        return this.getContractCallData(
            SeriesNonceManagerMethods.nonceEquals,
            [series, makerAddress, makerNonce],
        );
    }


    
    private getContractCallData(
        methodName: SeriesNonceManagerMethods,
        methodParams: unknown[] = []
    ): string {
        return this.providerConnector.contractEncodeABI(
            SERIES_NONCE_MANAGER_ABI,
            this.contractAddress,
            methodName,
            methodParams,
        );
    }
}