import {AbstractSmartcontractFacade} from "./utils/abstract-facade";
import {
    LimitOrder,
    LimitOrderProtocolMethodsV3
} from "./model/limit-order-protocol.model";
import {LIMIT_ORDER_PROTOCOL_V3_ABI} from "./limit-order-protocol.const";

export class LimitOrderProtocolV3Facade
    extends AbstractSmartcontractFacade<LimitOrderProtocolMethodsV3> {
    ABI = LIMIT_ORDER_PROTOCOL_V3_ABI;

    cancelLimitOrderV3(order: LimitOrder): string {
        // use old ABI
        return this.getContractCallData(LimitOrderProtocolMethodsV3.cancelOrder, [
            order,
        ]);
    }
}
