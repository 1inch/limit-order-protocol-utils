import {Web3ProviderConnector} from './web3-provider.connector';
import Web3 from 'web3';
import {anything, instance, mock, verify, when} from 'ts-mockito';
import {
    EIP712_DOMAIN,
    LIMIT_ORDER_PROTOCOL_ABI,
} from '../limit-order-protocol.const';
import {Eth} from 'web3-eth';
import {ORDER_STRUCTURE_LEGACY} from "../model/eip712.model";

describe('Web3ProviderConnector', () => {
    let web3Provider: Web3;
    let web3ProviderConnector: Web3ProviderConnector;

    const typedData = {
        primaryType: 'Order',
        types: {
            EIP712Domain: EIP712_DOMAIN,
            Order: ORDER_STRUCTURE_LEGACY
        },
        domain: {
            name: '1inch Aggregation Router',
            version: '5',
            chainId: 1,
            verifyingContract: '',
        },
        message: {},
    };

    beforeEach(() => {
        web3Provider = mock<Web3>();
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        );
    });

    it('signTypedData() must call eth_signTypedData_v4 rpc method', async () => {
        const walletAddress = '0xasd';

        const extendedWeb3 = {
            signTypedDataV4: jest.fn(),
        };

        when(web3Provider.extend(anything())).thenReturn(extendedWeb3);

        await web3ProviderConnector.signTypedData(walletAddress, typedData, '');

        expect(extendedWeb3.signTypedDataV4).toHaveBeenCalledWith(
            walletAddress,
            JSON.stringify(typedData)
        );
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

        web3ProviderConnector.contractEncodeABI(
            LIMIT_ORDER_PROTOCOL_ABI,
            null,
            'foo',
            []
        );

        verify(eth.Contract).once();
    });
});
