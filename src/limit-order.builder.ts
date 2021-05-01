import {
    EIP712_DOMAIN,
    ORDER_STRUCTURE,
    PROTOCOL_VERSION,
    ZERO_ADDRESS,
    PROTOCOL_NAME,
    LIMIT_ORDER_PROTOCOL_ABI,
    ZX,
} from './limit-order-protocol.const';
import {
    ChainId,
    LimitOrder,
    LimitOrderProtocolMethods,
    LimitOrderData,
    LimitOrderHash,
    LimitOrderSignature,
} from './model/limit-order-protocol.model';
import {EIP712TypedData, MessageTypes} from './model/eip712.model';
import {TypedDataUtils, TypedMessage} from 'eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';
import {Erc20Facade} from './erc20.facade';

export class LimitOrderBuilder {
    private readonly erc20Facade: Erc20Facade;

    constructor(
        private readonly contractAddress: string,
        private readonly chainId: ChainId,
        private readonly providerConnector: ProviderConnector
    ) {
        this.erc20Facade = new Erc20Facade(this.providerConnector);
    }

    buildOrderSignature(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<LimitOrderSignature> {
        return this.providerConnector.signTypedData(walletAddress, typedData);
    }

    buildOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
        const message = orderTypedData as TypedMessage<MessageTypes>;

        return ZX + TypedDataUtils.sign(message).toString('hex');
    }

    // TODO: extend type regarding MessageTypes
    buildOrderTypedData(order: LimitOrder): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE,
            },
            domain: {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: this.chainId,
                verifyingContract: this.contractAddress,
            },
            message: order,
        };
    }

    /* eslint-disable max-lines-per-function */
    buildOrder({
        makerAssetAddress,
        takerAssetAddress,
        makerAddress,
        takerAddress = ZERO_ADDRESS,
        makerAmount,
        takerAmount,
        predicate = ZX,
        permit = ZX,
        interaction = ZX,
    }: LimitOrderData): LimitOrder {
        return {
            salt: this.generateSalt(),
            makerAsset: makerAssetAddress,
            takerAsset: takerAssetAddress,
            makerAssetData: this.erc20Facade.transferFrom(
                makerAssetAddress,
                makerAddress,
                takerAddress,
                makerAmount
            ),
            takerAssetData: this.erc20Facade.transferFrom(
                makerAssetAddress,
                takerAddress,
                makerAddress,
                takerAmount
            ),
            getMakerAmount: this.getAmountData(
                LimitOrderProtocolMethods.getMakerAmount,
                makerAmount,
                takerAmount
            ),
            getTakerAmount: this.getAmountData(
                LimitOrderProtocolMethods.getTakerAmount,
                makerAmount,
                takerAmount
            ),
            predicate,
            permit,
            interaction,
        };
    }
    /* eslint-enable max-lines-per-function */

    private generateSalt(): string {
        return Math.round(Math.random() * Date.now()) + '';
    }

    // Get nonce from contract (nonces method) and put it to predicate on order creating
    private getAmountData(
        methodName: LimitOrderProtocolMethods,
        makerAmount: string,
        takerAmount: string,
        swapTakerAmount = '0'
    ): string {
        return this.getContractCallData(methodName, [
            makerAmount,
            takerAmount,
            swapTakerAmount,
        ]).substr(0, 2 + 68 * 2);
    }

    private getContractCallData(
        methodName: LimitOrderProtocolMethods,
        methodParams: unknown[] = []
    ): string {
        return this.providerConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            this.contractAddress,
            methodName,
            methodParams
        );
    }
}
