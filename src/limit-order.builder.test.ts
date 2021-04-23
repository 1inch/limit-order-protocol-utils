import {LimitOrderBuilder} from "./limit-order.builder";
import {ProviderConnector} from "./connector/provider.connector";
import {instance, mock, when} from "ts-mockito";
import {EIP712TypedData} from "./model/eip712.model";
import {EIP712_DOMAIN, ORDER_STRUCTURE, PROTOCOL_NAME, PROTOCOL_VERSION} from "./limit-order-protocol.const";

describe('LimitOrderBuilder - for build new limit order', () => {
    const contractAddress = '0xaaaaa';
    const chainId = 56;

    let providerConnector: ProviderConnector;
    let limitOrderBuilder: LimitOrderBuilder;

    beforeEach(() => {
        providerConnector = mock<ProviderConnector>();
        limitOrderBuilder = new LimitOrderBuilder(
            contractAddress,
            chainId,
            instance(providerConnector)
        );
    });

    it('buildOrderSignature() must call provider signTypedData', async () => {
        const walletAddress = '0xggggg';
        const typedData: EIP712TypedData = {
            primaryType: 'Order',
            types: {
                EIP712Domain: EIP712_DOMAIN,
                Order: ORDER_STRUCTURE
            },
            domain: {
                name: PROTOCOL_NAME,
                version: PROTOCOL_VERSION,
                chainId: chainId,
                verifyingContract: contractAddress
            },
            message: {
                foo: 'bar'
            },
        };
        const expectedSignature = '0x6767676767';

        when(providerConnector.signTypedData(walletAddress, typedData))
            .thenReturn(Promise.resolve(expectedSignature));

        const signature = await limitOrderBuilder.buildOrderSignature(walletAddress, typedData);

        expect(signature).toBe(expectedSignature);
    });
});
