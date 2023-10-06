import {LimitOrder, LimitOrderSignature} from "./model/limit-order-protocol.model";
import {Address} from "./model/eth.model";
import {EIP712ParamsExtended} from "./limit-order.builder";
import {EIP712TypedData} from "./model/eip712.model";
import {EIP712_DOMAIN} from "./limit-order-protocol.const";
import {SignTypedDataVersion, TypedDataUtils} from "@metamask/eth-sig-util";
import {ProviderConnector} from "./connector/provider.connector";

export class LimitOrderSignatureBuilder {
    constructor(
        private readonly providerConnector: ProviderConnector,
        private readonly eip712Params: EIP712ParamsExtended,
    ) {
    }

    buildLimitOrderTypedData(
        order: LimitOrder,
        chainId: number,
        verifyingContract: Address,
    ): EIP712TypedData {
        return {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: this.eip712Params.orderStructure,
            },
            domain: {
                name: this.eip712Params.domainName,
                version: this.eip712Params.version,
                chainId: chainId,
                verifyingContract: verifyingContract,
            },
            message: order,
        };
    }

    buildTypedDataAndSign(
        order: LimitOrder,
        chainId: number,
        verifyingContract: Address,
        wallet: Address,
    ): Promise<LimitOrderSignature> {
        const typedData = this.buildLimitOrderTypedData(
            order,
            chainId,
            verifyingContract,
        );
        return this.buildOrderSignature(wallet, typedData);
    }

    buildOrderSignature(
        wallet: Address,
        typedData: EIP712TypedData
    ): Promise<LimitOrderSignature> {
        const dataHash = TypedDataUtils.hashStruct(
            typedData.primaryType,
            typedData.message,
            typedData.types,
            SignTypedDataVersion.V4
        ).toString('hex');

        return this.providerConnector.signTypedData(
            wallet,
            typedData,
            dataHash,
        );
    }
}
