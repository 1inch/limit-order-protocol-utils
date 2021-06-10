import Web3 from 'web3';
import {instance, mock, verify, when} from 'ts-mockito';
import {
    EIP712_DOMAIN,
    LIMIT_ORDER_PROTOCOL_ABI,
    ORDER_STRUCTURE,
    PROTOCOL_NAME,
    PROTOCOL_VERSION,
} from '../limit-order-protocol.const';
import {Eth} from 'web3-eth';
import {PrivateKeyProviderConnector} from './private-key-provider.connector';
import {LimitOrder} from '../model/limit-order-protocol.model';
import {EIP712TypedData} from '../model/eip712.model';

describe('PrivateKeyProviderConnector', () => {
    let web3Provider: Web3;
    let privateKeyProviderConnector: PrivateKeyProviderConnector;

    const testPrivateKey =
        'd8d1f95deb28949ea0ecc4e9a0decf89e98422c2d76ab6e5f736792a388c56c7';
    const limitOrder: LimitOrder = {
        salt: '1469462901577',
        getMakerAmount:
            '0xf4a215c30000000000000000000000000000000000000000000000',
        getTakerAmount:
            '0x296637bf0000000000000000000000000000000000000000000000',
        makerAsset: '0x111111111117dc0aa78b770fa6a738034120c302',
        takerAsset: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        makerAssetData:
            '0x23b872dd000000000000000000000000fb3c7eb936caa12b5a884d612393969a557d43070000',
        takerAssetData:
            '0x23b872dd00000000000000000000000000000000000000000000000000000000000000000000',
        interaction: '0x',
        permit: '0x',
        predicate: '0x',
    };
    const typedData: EIP712TypedData = {
        primaryType: 'Order',
        types: {
            EIP712Domain: EIP712_DOMAIN,
            Order: ORDER_STRUCTURE,
        },
        domain: {
            name: PROTOCOL_NAME,
            version: PROTOCOL_VERSION,
            chainId: 1,
            verifyingContract: '',
        },
        message: limitOrder,
    };

    beforeEach(() => {
        web3Provider = mock<Web3>();
        privateKeyProviderConnector = new PrivateKeyProviderConnector(
            testPrivateKey,
            instance(web3Provider)
        );
    });

    it('signTypedData() must sign typed data by private key', async () => {
        const walletAddress = '0xa07c1d51497fb6e66aa2329cecb86fca0a957fdb';
        const expectedSignature =
            '0x00efa043cc010fa4fb9850dc860ee44a9ffbe' +
            '5d719f5982137cb40d46bdb01fe2f38b4149d4463a7eb2197a47794691f46' +
            'a373dd2db3a38b5c550a44f30fee2f1b';

        const signature = await privateKeyProviderConnector.signTypedData(
            walletAddress,
            typedData
        );

        expect(signature).toBe(expectedSignature);
    });

    it('contractEncodeABI() changed address from null to undefined for contract instance', async () => {
        const eth = mock<Eth>();
        class ContractMock {
            methods = {
                foo: () => ({encodeABI: () => ''}),
            };
        }

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        when(eth.Contract).thenReturn(ContractMock as any);
        when(web3Provider.eth).thenReturn(instance(eth));

        privateKeyProviderConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            null,
            'foo',
            []
        );

        verify(eth.Contract).once();
    });
});
