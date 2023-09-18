import {ProviderConnector} from './connector/provider.connector';
import {
    InteractionsV3,
    LimitOrderDataLegacy,
    LimitOrderInteractions,
    LimitOrderLegacy,
} from './model/limit-order-protocol.model';
import {
    ZERO_ADDRESS,
    ZX
} from './limit-order-protocol.const';
import {ORDER_STRUCTURE_LEGACY} from './model/eip712.model';
import {EIP712Params, generateOrderSalt} from './limit-order.builder';
import {BaseLimitOrderBuilder} from "./base-limit-order.builder";

export class LimitOrderV3Builder extends BaseLimitOrderBuilder<LimitOrderLegacy> {
    constructor(
        protected readonly providerConnector: ProviderConnector,
        protected readonly eip712Params: EIP712Params,
    ) {
        super(
            providerConnector,
            {
                ...eip712Params,
                orderStructure: ORDER_STRUCTURE_LEGACY,
            }
        )
    }

    packInteractions({
                                      makerAssetData = ZX,
                                      takerAssetData = ZX,
                                      getMakingAmount = ZX,
                                      getTakingAmount = ZX,
                                      predicate = ZX,
                                      permit = ZX,
                                      preInteraction = ZX,
                                      postInteraction = ZX,
                                  }: Partial<InteractionsV3>): LimitOrderInteractions {
        const allInteractions = [
            makerAssetData,
            takerAssetData,
            getMakingAmount,
            getTakingAmount,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        ];

        const {
            offsets, data: interactions
        } = BaseLimitOrderBuilder.joinStaticCalls(allInteractions);
        return { offsets: ZX + offsets.toString(16), interactions };
    }

    buildLimitOrder({
                              makerAssetAddress,
                              takerAssetAddress,
                              makerAddress,
                              receiver = ZERO_ADDRESS,
                              allowedSender = ZERO_ADDRESS,
                              makingAmount,
                              takingAmount,
                              predicate = ZX,
                              permit = ZX,
                              getMakingAmount = ZX,
                              getTakingAmount = ZX,
                              preInteraction = ZX,
                              postInteraction = ZX,
                              salt = generateOrderSalt(),
                          }: LimitOrderDataLegacy
    ): LimitOrderLegacy {

        const makerAssetData = ZX;
        const takerAssetData = ZX;

        const { offsets, interactions } = this.packInteractions({
            makerAssetData,
            takerAssetData,
            getMakingAmount,
            getTakingAmount,
            predicate,
            permit,
            preInteraction,
            postInteraction,
        })

        return {
            salt,
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            maker: makerAddress,
            receiver,
            allowedSender,
            makingAmount,
            takingAmount,
            offsets,
            interactions,
        };
    }
}
