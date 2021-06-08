<p align="center">
  <img src="https://app.1inch.io/assets/images/logo.svg" width="200" alt="1inch network" />
</p>

# Utils for limit orders protocol

This is the package of utilities for working with the `1inch limit orders protocol`

[LimitOrderBuilder](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order.builder.ts) - to create a limit order  
[LimitOrderPredicateBuilder](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-predicate.builder.ts) - to create a predicate for limit order  
[LimitOrderProtocolFacade](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-protocol.facade.ts) - to interact with the protocol on the blockchain

---

## Test coverage

| Statements                                                                    | Branches                                                                    | Functions                                                                  | Lines                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ![Statements](https://img.shields.io/badge/Coverage-97.64%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-92.86%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-97.64%25-brightgreen.svg) |

## Installation

### Node

```
npm install @1inch/limit-order-protocol
```

### Yarn

```
yarn add @1inch/limit-order-protocol
```

## Protocol addresses

-   Ethereum mainnet: `0x3ef51736315f52d568d6d2cf289419b9cfffe782`
-   BSC mainnet: `0xe3456f4ee65e745a44ec3bcb83d0f2529d1b84eb`
-   Polygon mainnet: `0xb707d89d29c189421163515c59e42147371d6857`

---

## Contributing

See [CONTRIBUTING.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CONTRIBUTING.md)

## Changelog

See [CHANGELOG.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CHANGELOG.md)

---

## Motivation

A limit order is an order to buy or sell at a specified or better price.  
A limit order excludes the possibility of execution at a less favorable price than a limit order, however, its execution is not guaranteed.

Inch protocol limit orders have many tools for flexible management:

-   partial fill
-   predicates
-   single cancellation
-   bunch cancellation
-   fullness check
-   validation

---

## Docs

0. [Quick start](#Quick-start)
1. [Create a limit order](#Create-a-limit-order)
2. [Limit order remaining](#Limit-order-remaining)
3. [Nonce](#Nonce)
4. [Validate a limit order](#Validate-a-limit-order)
5. [Predicate](#Predicate)
6. [Fill a limit order](#Fill-a-limit-order)
7. [Cancel a limit order](#Cancel-a-limit-order)
8. [Cancel all limit orders](#Cancel-all-limit-orders)
9. [Domain separator](#Domain-separator)
10. [Limit order RFQ](#Limit-order-RFQ)

## Quick start

```typescript
import {
    LimitOrderBuilder,
    LimitOrderProtocolFacade,
} from '@1inch/limit-order-protocol';

const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
const walletAddress = '0x4758822de63992df27cacf1ba11417bbacace033';
const chainId = 1;

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
const connector = new Web3ProviderConnector(web3);

const limitOrderBuilder = new LimitOrderBuilder(
    contractAddress,
    chainId,
    connector
);

const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
    contractAddress,
    connector
);

// Create a limit order and it's signature
const limitOrder = limitOrderBuilder.buildOrder({
    makerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
    makerAddress: walletAddress,
    makerAmount: '100',
    takerAmount: '200',
    predicate: '0x0',
    permit: '0x0',
    interaction: '0x0',
});
const limitOrderTypedData = limitOrderBuilder.buildOrderTypedData(limitOrder);
const limitOrderSignature = limitOrderBuilder.buildOrderSignature(
    walletAddress,
    limitOrderTypedData
);

// Create a call data for fill the limit order
const callData = limitOrderProtocolFacade.fillOrder(
    limitOrder,
    limitOrderSignature,
    '100',
    '0',
    '50'
);

// Send transaction for the order filling
// Must be implemented
sendTransaction({
    from: walletAddress,
    gas: 210_000, // Set your gas limit
    gasPrice: 40000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

**Note:** you can use any implementation for the provider.  
Just implement `ProviderConnector` interface:

```typescript
class MyProviderConnector implements ProviderConnector {
    //...
}
```

## Create a limit order

`LimitOrderBuilder.buildOrder()`

Parameters for creating a limit order:

-   `makerAssetAddress` - an address of the maker token
-   `takerAssetAddress` - an address of the taker token
-   `makerAddress` - an address of the maker (wallet address)
-   `takerAddress` - an address of the taker. Default: `0x0000000000000000000000000000000000000000`
-   `makerAmount` - an amount of maker token, in the wei units
-   `takerAmount` - an amount of taker token, in the wei units
-   `predicate` - a predicate call data. Default: `0x`
-   `permit` - a permit call data. Default: `0x`
-   `interaction` - an interaction call data. Default: `0x`

> Note:  
> `takerAddress` - if set, then the limit order will be available for filling only for this address

### Example:

```typescript
import {LimitOrderBuilder} from '@1inch/limit-order-protocol';

const limitOrderBuilder = new LimitOrderBuilder();
// ...

const limitOrder = limitOrderBuilder.buildOrder({
    makerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
    makerAddress: '0xfb3c7ebccccAA12B5A884d612393969Adddddddd',
    makerAmount: '100',
    takerAmount: '200',
    predicate: '0x0',
    permit: '0x0',
    interaction: '0x0',
});
const limitOrderTypedData = limitOrderBuilder.buildOrderTypedData(limitOrder);
const limitOrderSignature = limitOrderBuilder.buildOrderSignature(
    walletAddress,
    limitOrderTypedData
);
const limitOrderHash = limitOrderBuilder.buildOrderHash(limitOrderTypedData);
```

## Limit order remaining

`LimitOrderProtocolFacade.remaining()`

By default, a limit order is created unfilled.  
Until the first fill the `remaining` method will throw error `LOP: Unknown order`.  
After the first fill, the method will return remaining amount.

> Note: a limit order can be partially filled

### Example:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrderHash,
} from '@1inch/limit-order-protocol';
import {BigNumber} from 'ethers/utils';

const orderMakerAmount = '400000000000'; // initial amount of the limit order
const orderHash: LimitOrderHash = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(
    contractAddress,
    connector
);

const remaining = await getRemaining(orderHash);

async function getRemaining(orderHash: string): string {
    try {
        const remaining: BigNumber = limitOrderProtocolFacade.remaining(
            orderHash
        );

        return remaining.toString();
    } catch (error) {
        const errorMessage = typeof error === 'string' ? error : error.message;

        if (errorMessage.includes('LOP: Unknown order')) {
            return orderMakerAmount;
        }

        throw error;
    }
}
```

## Nonce

`LimitOrderProtocolFacade.nonce()` - returns the nonce of the current wallet address  
`LimitOrderProtocolFacade.advanceNonce(count: number)` - increases the nonce by the count  
`LimitOrderProtocolFacade.increaseNonce()` - increases the nonce by 1

**Nonce** - this is the so-called `series` of limit orders.  
The nonce is useful when you need to create a bunch of limit orders with the ability to cancel them all later.

### Example:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrderPredicateBuilder
} from '@1inch/limit-order-protocol';

const walletAddress = '0xhhh...';
const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
const chainId = 1;

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(contractAddress, connector);
const limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(
    limitOrderProtocolFacade
);
const limitOrderBuilder = new LimitOrderBuilder(
    contractAddress,
    chainId,
    connector
);

// Get the current nonce
const nonce = await limitOrderProtocolFacade.nonce(contractAddress);

// Create a limit order with nonceEquals predicate
const predicate = limitOrderPredicateBuilder.nonceEquals(walletAddress, nonce);
const limitOrder = limitOrderBuilder.buildOrder({
    ...,
    predicate
});

// Cancel all orders by advance nonce
const cancelAllOrdersCallData = limitOrderProtocolFacade.advanceNonce();
sendTransaction({
    from: walletAddress,
    gas: 210_000, // Set your gas limit
    gasPrice: 40000, // Set your gas price
    to: contractAddress,
    data: cancelAllOrdersCallData,
});
```

## Validate a limit order

`LimitOrderProtocolFacade.simulateCalls()`

There is the possibility to check limit orders validity.  
For example: you can check that a limit order is valid by predicates.

> **Under the hood:**  
> On a `simulateCalls()` call, the contract returns the string like `CALL_RESULTS_01101`  
> If that string contains at least one `0` symbol, then a limit order is invalid, otherwise - valid

### Example:

```typescript
import {LimitOrderProtocolFacade, LimitOrder} from '@1inch/limit-order-protocol';

const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
const order: LimitOrder = {...};

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(contractAddress, connector);

const addresses = [contractAddress];
const callDatas = [order.predicate];

try {
    const result: boolean = await limitOrderProtocolFacade.simulateCalls(addresses, callDatas);

    console.log('Order validity: ', result);
} catch (error) {
    console.error(error);
}
```

## Predicate

`LimitOrderPredicateBuilder`

A limit order can contain one or more predicates which indicate the logic of its validity.  
**There are two types of a predicate operators:**

### Conditional operators:

-   `and` - combine several predicates, return `true` when all predicates are valid
-   `or` - combine several predicates, return `true` when the one of predicates is valid

### Comparative operators:

> All comparative operators have three arguments:  
> (**value**: string, **address**: string, **callData**: string)

> **How the operators works:**  
> On an operator call, the contract execute the `callData` for the `address` and compare _**a result**_ with the `value`

-   `eq` - _**a result**_ must be equal to the `value`
-   `lt` - _**a result**_ must be less than the `value`
-   `gt` - _**a result**_ must be greater than the `value`

### Built-in operators:

> `nonceEquals(makerAddress: string, makerNonce: number)`

The predicate checks that the `makerNonce` is equal to the nonce of `makerAddress`

---

> `timestampBelow(timestamp: number)`

The predicate checks that `timestamp` is greater than the current time

### Example:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrderPredicateBuilder,
    LimitOrderPredicateCallData
} from '@1inch/limit-order-protocol';

const makerAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
const tokenAddress = '0xsss...';
const balanceOfCallData = '0xccc...';

const limitOrderProtocolFacade = new LimitOrderProtocolFacade(...);

const limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(
    limitOrderProtocolFacade
);

const {or, and, timestampBelow, nonceEquals, gt, lt, eq} = predicateBuilder;

const simplePredicate: LimitOrderPredicateCallData = and(
    timestampBelow(Math.round(Date.now() / 1000) + 60_000), // a limit order is valid only for 1 minute
    nonceEquals(makerAddress, 4) // a limit order is valid until the nonce of makerAddress is equal to 4
);

const complexPredicate: LimitOrderPredicateCallData = or(
    and(
        timestampBelow(Math.round(Date.now() / 1000) + 60_000),
        nonceEquals(makerAddress, 4),
        gt('10', tokenAddress, balanceOfCallData)
    ),
    or(
        timestampBelow(5444440000),
        lt('20', tokenAddress, balanceOfCallData)
    ),
    eq('30', tokenAddress, balanceOfCallData)
);
```

## Fill a limit order

`LimitOrderProtocolFacade.fillOrder()`

Parameters for order filling:

-   `order: LimitOrder` - a limit order structure
-   `signature: LimitOrderSignature` - signature of a limit order
-   `makerAmount: string` - amount of maker asset (in token units)
-   `takerAmount: string` - amount of taker asset (in token units)
-   `thresholdAmount: string` - threshold for amount of received asset (in received asset units)

> Note: to fill a limit order, only one of the amounts must be specified  
> The second one must be set to `0`

### Example

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrder,
    LimitOrderSignature
} from '@1inch/limit-order-protocol';

const walletAddress = '0xhhh...';
const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';

const order: LimitOrder = {...};
const signature: LimitOrderSignature = '...';

const makerAmount = '400000000';
const takerAmount = '0';
const thresholdAmount = '600000000';

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(contractAddress, connector);

const callData = limitOrderProtocolFacade.fillOrder(
    order,
    signature,
    makerAmount,
    takerAmount,
    thresholdAmount
);

sendTransaction({
    from: walletAddress,
    gas: 210_000, // Set your gas limit
    gasPrice: 40000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

## Cancel a limit order

`LimitOrderProtocolFacade.cancelOrder()`

### Example:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrder
} from '@1inch/limit-order-protocol';

const walletAddress = '0xhhh...';
const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';

const order: LimitOrder = {...};

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(contractAddress, connector);

const callData = limitOrderProtocolFacade.cancelOrder(order);

sendTransaction({
    from: walletAddress,
    gas: 210_000, // Set your gas limit
    gasPrice: 40000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

## Cancel all limit orders

`LimitOrderProtocolFacade.advanceNonce(count)`  
or  
`LimitOrderProtocolFacade.increaseNonce()`

### First of all, read about [Nonce](#nonce)

`advanceNonce(count) or increaseNonce()` increments the nonce and all limit orders with a predicate to the previous nonce value become invalid

> **Warning!**  
> The approach only works when all orders have the `nonceEquals` predicate

### Example:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrder,
} from '@1inch/limit-order-protocol';

const walletAddress = '0xhhh...';
const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(
    contractAddress,
    connector
);

const callData = limitOrderProtocolFacade.increaseNonce();

sendTransaction({
    from: walletAddress,
    gas: 210_000, // Set your gas limit
    gasPrice: 40000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

## Domain separator

[Definition of domainSeparator](https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator)

### Example:

```typescript
import {LimitOrderProtocolFacade} from '@1inch/limit-order-protocol';

const domainSeparator = await LimitOrderProtocolFacade.domainSeparator();
```

## Limit order RFQ

**A request for quotation (RFQ)** is a business process in which a customer requests a quote from a supplier (market maker) for the purchase of some tokens.

**The 1inch Limit Order Protocol** allows to create offers for the sale / purchase of certain pairs of tokens.  
In other words, you can put up a pair of tokens for sale at the price you set.  
1inch Limit Order Protocol supports work only with EPC-20, BEP-20 tokens.

> Limit orders RFQ differ from ordinary orders in that they are optimized for frequent market trading, and their execution does not require a lot of gas.

---

### Creating a limit order:

#### Parameters:

1. `id` - is a pass-through, integer identifier starting at 1
2. `expire time` - is the timestamp in milliseconds when the limit order will no longer be available for execution. For example: 1623166270029
3. `maker asset address` - the address of the asset you want to sell (address of a token contract)
4. `taker asset address` - the address of the asset you want to buy (address of a token contract)
5. `maker amount` - the number of maker asset tokens that you want to sell (in token units). For example: 5 DAI = 5000000000000000000 units
6. `taker amount` - the number of taker asset tokens that you want to receive for selling the maker asset (in token units). For example: 5 DAI = 5000000000000000000 units
7. `taker address` - the address of the buyer for whom the limit order is being created. _This is an optional parameter_, if it is not specified, then the limit order will be available for execution for everyone

#### Creating with a typescript/javascript:

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

#### Creating via CLI (with arguments):

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

#### Creating via CLI (through prompt):

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

#### Limit order RFQ structure:

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

### Canceling a limit order:

It is assumed that limit orders RFQ will be created with a short lifetime.  
But, if it becomes necessary to cancel the created limit order RFQ, then this can be done as follows:

#### Parameters:

1. `info` - information about a limit order RFQ (see above in section [Limit order RFQ structure](#Limit-order-RFQ-structure))

#### Creating with a typescript/javascript:

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

#### Canceling via CLI (with arguments):

`gasPrice` - in units of GWEI

```shell
npx limit-order-rfq-utils --\
--operation=cancel \
--chainId=56 \
--privateKey={xxx} \
--gasPrice=6 \
--orderInfo=29941961886664662336741887180811
```

#### Canceling via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result, you will receive a link to the transaction hash.

---

### Filling a limit order:

A limit order can be filled in whole or in part.

> Important! You can fill in a limit order only once!

#### Parameters:

`order` - structure of the limit order RFQ (see [Limit order RFQ structure](#Limit-order-RFQ-structure))  
`signature` - signature of the typed date of the limit order RFQ (signTypedData_v4)
`makerAmount` - the number of maker asset tokens that you want to fill (in token units). For example: 5 DAI = 5000000000000000000 units
`takerAmount` - the number of taker asset tokens that you want to fill (in token units). For example: 5 DAI = 5000000000000000000 units

> important! Only one of the assets amounts can be not zero.
> For example, if you specified the maker amount, then the taker amount must be zero and vice versa.

#### Filling with a typescript/javascript:

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

#### Filling via CLI (with arguments):

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

#### Filling via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result, you will receive a link to the transaction hash.
