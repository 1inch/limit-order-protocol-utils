# Filling a limit order:

A limit order can be filled in whole or in part.

> Important! You can fill in a limit order only once!

## Parameters:

`order` - structure of the limit order RFQ (see [Limit order RFQ structure](#Limit-order-RFQ-structure))  
`signature` - signature of the typed date of the limit order RFQ (signTypedData_v4)  
`makerAmount` - the number of maker asset tokens that you want to fill (in token units). For example: 5 DAI = 5000000000000000000 units  
`takerAmount` - the number of taker asset tokens that you want to fill (in token units). For example: 5 DAI = 5000000000000000000 units

> important! Only one of the assets amounts can be not zero.
> For example, if you specified the maker amount, then the taker amount must be zero and vice versa.

## Filling with a typescript/javascript:

```typescript
import {
    LimitOrderBuilder,
    LimitOrderProtocolFacade,
    LimitOrderRFQ
} from '@1inch/limit-order-protocol';

const contractAddress = '0x7643b8c2457c1f36dc6e3b8f8e112fdf6da7698a';
const walletAddress = '0xd337163ef588f2ee7cdd30a3387660019be415c9';

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
const connector = new Web3ProviderConnector(web3);

const limitOrderBuilder = new LimitOrderBuilder(
    contractAddress,
    chainId,
    connector
);

const limitOrderProtocolFacade = new limitOrderProtocolFacade(
    contractAddress,
    connector
);

const orderRFQ: LimitOrderRFQ = {...};

const typedData = limitOrderBuilder.buildOrderRFQTypedData(orderRFQ);
const signature = await limitOrderBuilder.buildOrderSignature(
    walletAddress,
    typedData
);
const makerAmount = '1000000000000000000';
const takerAmount = '0';

const callData = facade.fillOrderRFQ(
    order,
    signature,
    makerAmount,
    takerAmount
);

// Send transaction for the limit order RFQ filling
// Must be implemented
sendTransaction({
    from: walletAddress,
    gas: 150_000, // Set your gas limit
    gasPrice: 600000000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

## Filling via CLI (with arguments):

`gasPrice` - in units of GWEI

```shell
npx limit-order-rfq-utils --\
--operation=fill \
--chainId=56 \
--privateKey={xxx} \
--gasPrice=6 \
--order="{ \
    \"info\": \"29941961886664662336741887180811\", \
    \"makerAsset\": \"0x111111111117dc0aa78b770fa6a738034120c302\", \
    \"takerAsset\": \"0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3\", \
    \"makerAssetData\": \"0x23b872dd00...000\", \
    \"takerAssetData\": \"0x23b872dd00...000\" \
}" \
--makerAmount=1000000000000000000 \
--takerAmount=0
```

## Filling via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result, you will receive a link to the transaction hash.
