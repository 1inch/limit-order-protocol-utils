# Limit order RFQ

**A request for quotation (RFQ)** is a business process in which a customer requests a quote from a supplier (market maker) for the purchase of some tokens.

**The 1inch Limit Order Protocol** allows to create offers for the sale / purchase of certain pairs of tokens.  
In other words, you can put up a pair of tokens for sale at the price you set.  
1inch Limit Order Protocol supports work only with EPC-20, BEP-20 tokens.

> Limit orders RFQ differ from ordinary orders in that they are optimized for frequent market trading, and their execution does not require a lot of gas.

### Docs:

1. [Creating a limit order](#Creating-a-limit-order)
2. [Canceling a limit order](#Canceling-a-limit-order)
3. [Filling a limit order](#Filling-a-limit-order)

---

## Creating a limit order:

### Parameters:

1. `id` - is a pass-through, integer identifier starting at 1
2. `expire time` - is the timestamp in milliseconds when the limit order will no longer be available for execution. For example: 1623166270029
3. `maker asset address` - the address of the asset you want to sell (address of a token contract)
4. `taker asset address` - the address of the asset you want to buy (address of a token contract)
5. `maker amount` - the number of maker asset tokens that you want to sell (in token units). For example: 5 DAI = 5000000000000000000 units
6. `taker amount` - the number of taker asset tokens that you want to receive for selling the maker asset (in token units). For example: 5 DAI = 5000000000000000000 units
7. `taker address` - the address of the buyer for whom the limit order is being created. _This is an optional parameter_, if it is not specified, then the limit order will be available for execution for everyone

### Creating with a typescript/javascript:

```typescript
import {LimitOrderBuilder} from '@1inch/limit-order-protocol';

const contractAddress = '0x7643b8c2457c1f36dc6e3b8f8e112fdf6da7698a';
const walletAddress = '0xd337163ef588f2ee7cdd30a3387660019be415c9';
const chainId = 1;

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
const connector = new Web3ProviderConnector(web3);

const limitOrderBuilder = new LimitOrderBuilder(
    contractAddress,
    chainId,
    connector
);

const orderRFQ = await limitOrderBuilder.buildOrderRFQ({
    id: 1,
    expiresInTimestamp: 1623166102,
    makerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
    takerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    makerAddress: walletAddress,
    makerAmount: '1000000000000000000',
    takerAmount: '9000000000000000000',
});
```

### Creating via CLI (with arguments):

```shell
npx limit-order-rfq-utils --\
--operation=create \
--chainId=56 \
--privateKey={xxx} \
--orderId=1 \
--expiresIn=300 \
--makerAssetAddress=0x111111111117dc0aa78b770fa6a738034120c302 \
--takerAssetAddress=0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3 \
--makerAmount=1000000000000000000 \
--takerAmount=4000000000000000000 \
--takerAddress=""
```

### Creating via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result you will receive a JSON structure of limit order RFQ. Example:

```json
{
    "info": "29941961886664662331741887180822",
    "makerAsset": "0x111111111117dc0aa78b770fa6a738034120c302",
    "takerAsset": "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    "makerAssetData": "0x23b872dd00000000...0000",
    "takerAssetData": "0x23b872dd00000000...0000"
}
```

### Limit order RFQ structure:

`info` - information about a limit order RFQ, encoded as a decimal number, which contains:

-   the id of the limit order
-   the timestamp of its expiration

Example of generating a limit order RFQ info:

```javascript
const id = 1;
const expiresInTimestamp = 1623166102;
const info = ((BigInt(expiresInTimestamp) << BigInt(64)) | BigInt(id)).toString(
    10
);
```

`makerAsset` - the address of the asset you want to sell (address of a token contract)  
`takerAsset` - the address of the asset you want to buy (address of a token contract)  
`makerAssetData` - the technical info about a maker asset and its amount  
`takerAssetData` - the technical info about a taker asset and its amount

---

## Canceling a limit order:

It is assumed that limit orders RFQ will be created with a short lifetime.  
But, if it becomes necessary to cancel the created limit order RFQ, then this can be done as follows:

### Parameters:

1. `info` - information about a limit order RFQ (see above in section [Limit order RFQ structure](#Limit-order-RFQ-structure))

### Creating with a typescript/javascript:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrderRFQ
} from '@1inch/limit-order-protocol';

const contractAddress = '0x7643b8c2457c1f36dc6e3b8f8e112fdf6da7698a';
const walletAddress = '0xd337163ef588f2ee7cdd30a3387660019be415c9';

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
const connector = new Web3ProviderConnector(web3);

const limitOrderProtocolFacade = new limitOrderProtocolFacade(
    contractAddress,
    connector
);

const orderRFQ: LimitOrderRFQ = {...};

const callData = limitOrderProtocolFacade.cancelOrderRFQ(orderRFQ.info);

// Send transaction for the limit order RFQ canceling
// Must be implemented
sendTransaction({
    from: walletAddress,
    gas: 50_000, // Set your gas limit
    gasPrice: 600000000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

### Canceling via CLI (with arguments):

`gasPrice` - in units of GWEI

```shell
npx limit-order-rfq-utils --\
--operation=cancel \
--chainId=56 \
--privateKey={xxx} \
--gasPrice=6 \
--orderInfo=29941961886664662336741887180811
```

### Canceling via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result, you will receive a link to the transaction hash.

---

## Filling a limit order:

A limit order can be filled in whole or in part.

> Important! You can fill in a limit order only once!

### Parameters:

`order` - structure of the limit order RFQ (see [Limit order RFQ structure](#Limit-order-RFQ-structure))  
`signature` - signature of the typed date of the limit order RFQ (signTypedData_v4)
`makerAmount` - the number of maker asset tokens that you want to fill (in token units). For example: 5 DAI = 5000000000000000000 units
`takerAmount` - the number of taker asset tokens that you want to fill (in token units). For example: 5 DAI = 5000000000000000000 units

> important! Only one of the assets amounts can be not zero.
> For example, if you specified the maker amount, then the taker amount must be zero and vice versa.

### Filling with a typescript/javascript:

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

### Filling via CLI (with arguments):

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

### Filling via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result, you will receive a link to the transaction hash.
