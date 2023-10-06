import {ProviderConnector} from "./connector/provider.connector";
import {EIP712ParamsExtended} from "./limit-order.builder";
import {LimitOrderSignatureBuilder} from "./limit-order-signature.builder";
import {LimitOrderHash, LimitOrderSignature} from "./model/limit-order-protocol.model";
import {Address} from "./model/eth.model";
import {EIP712Object, EIP712TypedData, MessageTypes} from "./model/eip712.model";
import {SignTypedDataVersion, TypedDataUtils, TypedMessage} from "@metamask/eth-sig-util";
import {bufferToHex} from "ethereumjs-util";
import {EIP712_DOMAIN, ZX} from "./limit-order-protocol.const";
import {getOffsets, trim0x} from "./utils/limit-order.utils";

export abstract class BaseLimitOrderBuilder<OrderType extends EIP712Object> {
    private readonly signatureBuilder: LimitOrderSignatureBuilder;

    constructor(
        protected readonly providerConnector: ProviderConnector,
        protected readonly eip712ParamsExtended: EIP712ParamsExtended,
    ) {
        this.signatureBuilder = new LimitOrderSignatureBuilder(
            this.providerConnector,
            this.eip712ParamsExtended,
        );
    }

    static joinStaticCalls(data: string[]): { offsets: bigint, data: string } {
        const trimmed = data.map(trim0x);

        return {
            offsets: getOffsets(trimmed),
            data: ZX + trimmed.join(''),
        };
    }

    buildLimitOrderTypedData(
        order: OrderType,
        chainId: number,
        verifyingContract: Address,
    ): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: this.eip712ParamsExtended.orderStructure,
            },
            domain: {
                name: this.eip712ParamsExtended.domainName,
                version: this.eip712ParamsExtended.version,
                chainId: chainId,
                verifyingContract: verifyingContract,
            },
            message: order,
        };
    }

    buildTypedDataAndSign(
        order: OrderType,
        chainId: number,
        verifyingContract: Address,
        wallet: Address,
    ): Promise<LimitOrderSignature> {
        const typedData = this.buildLimitOrderTypedData(order, chainId, verifyingContract);
        return this.signatureBuilder.buildOrderSignature(
            wallet,
            typedData,
        );
    }

    buildOrderSignature(
        wallet: Address,
        typedData: EIP712TypedData
    ): Promise<LimitOrderSignature> {
        return this.signatureBuilder.buildOrderSignature(
            wallet,
            typedData,
        );
    }

    buildLimitOrderHash(orderTypedData: EIP712TypedData): LimitOrderHash {
        const message = orderTypedData as TypedMessage<MessageTypes>;
        const hash = bufferToHex(TypedDataUtils.eip712Hash(message, SignTypedDataVersion.V4));
        return ZX + hash.substring(2);
    }
}
