import Web3 from 'web3';
import {instance, mock, verify, when} from 'ts-mockito';
import {
    EIP712_DOMAIN,
    LIMIT_ORDER_PROTOCOL_V3_ABI,
} from '../limit-order-protocol.const';
import {Eth} from 'web3-eth';
import {PrivateKeyProviderConnector} from './private-key-provider.connector';
import {LimitOrderLegacy} from '../model/limit-order-protocol.model';
import {EIP712TypedData, ORDER_STRUCTURE_LEGACY} from '../model/eip712.model';

describe('PrivateKeyProviderConnector', () => {
    let web3Provider: Web3;
    let privateKeyProviderConnector: PrivateKeyProviderConnector;

    const testPrivateKey =
        'd8d1f95deb28949ea0ecc4e9a0decf89e98422c2d76ab6e5f736792a388c56c7';
    const limitOrder: LimitOrderLegacy = {
        salt: "618054093254",
        makerAsset: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        takerAsset: "0x111111111117dc0aa78b770fa6a738034120c302",
        maker: "0xfb3c7eb936cAA12B5A884d612393969A557d4307",
        receiver: "0x0000000000000000000000000000000000000000",
        allowedSender: "0x0000000000000000000000000000000000000000",
        makingAmount: "1000000000000000000",
        takingAmount: "1000000000000000000",
        offsets: "9813420589127697917471531885823684359047649055178615469676279994777600",
        // eslint-disable-next-line max-len
        interactions: "0x20b83f2d0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a76400007e2d21830000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a7640000bfa7514300000000000000000000000000000000000000000000000000000068000000240000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006863592c2b0000000000000000000000000000000000000000000000000000000063593ad9cf6fc6e3000000000000000000000000fb3c7eb936caa12b5a884d612393969a557d43070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      };
    const typedData: EIP712TypedData = {
        primaryType: 'Order',
        types: {
            EIP712Domain: EIP712_DOMAIN,
            Order: ORDER_STRUCTURE_LEGACY,
        },
        domain: {
            name: '1inch Aggregation Router',
            version: '5',
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

        const signature = await privateKeyProviderConnector.signTypedData(
            walletAddress,
            typedData
        );

        expect(signature).toMatchSnapshot();
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
            LIMIT_ORDER_PROTOCOL_V3_ABI,
            null,
            'foo',
            []
        );

        verify(eth.Contract).once();
    });
});
