import {AbstractSmartcontractFacade} from "./utils/abstract-facade";
import {
    LimitOrderLegacy,
    LimitOrderProtocolMethodsV3
} from "./model/limit-order-protocol.model";
import {LIMIT_ORDER_PROTOCOL_V3_ABI} from "./limit-order-protocol.const";
import {BigNumber} from "@ethersproject/bignumber";

export class LimitOrderProtocolV3Facade
    extends AbstractSmartcontractFacade<LimitOrderProtocolMethodsV3> {
    ABI = LIMIT_ORDER_PROTOCOL_V3_ABI;

    checkPredicate(order: LimitOrderLegacy): Promise<boolean> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethodsV3.checkPredicate,
            [order]
        );

        return this.providerConnector
            .ethCall(this.contractAddress, callData)
            .catch((error) => {
                console.error(error);

                return false;
            })
            .then((result) => {
                try {
                    return BigNumber.from(result).toNumber() === 1;
                } catch (e) {
                    console.error(e);

                    return false;
                }
            });
    }

    cancelLimitOrder(order: LimitOrderLegacy): string {
        return this.getContractCallData(LimitOrderProtocolMethodsV3.cancelOrder, [
            order,
        ]);
    }

    async nonce(makerAddress: string): Promise<bigint> {
        const callData = this.getContractCallData(
            LimitOrderProtocolMethodsV3.nonce,
            [makerAddress]
        );

        const nonce = await this.providerConnector
            .ethCall(this.contractAddress, callData);
        return BigInt(nonce);
    }

    advanceNonce(count: number): string {
        return this.getContractCallData(
            LimitOrderProtocolMethodsV3.advanceNonce,
            [count]
        );
    }

    increaseNonce(): string {
        return this.getContractCallData(
            LimitOrderProtocolMethodsV3.increaseNonce
        );
    }
}
