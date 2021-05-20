<p align="center">
  <img src="https://app.1inch.io/assets/images/logo.svg" width="200" alt="1inch network" />
</p>

# Utils for limit orders protocol

This is the package of utilities for working with the `1inch limit orders protocol`

[LimitOrderBuilder](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order.builder.ts) - to create a limit order  
[LimitOrderPredicateBuilder](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-predicate.builder.ts) - to create a predicates for limit order  
[LimitOrderProtocolFacade](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-protocol.facade.ts) - to interact with the protocol on the blockchain

---

## Test coverage

| Statements                                                                    | Branches                                                                    | Functions                                                                  | Lines                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ![Statements](https://img.shields.io/badge/Coverage-98.97%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-96.88%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-98.97%25-brightgreen.svg) |

## Installation

### Node

```
npm install @1inch/limit-order-protocol
```

### Yarn

```
yarn install @1inch/limit-order-protocol
```

## Protocol addresses

-   Ethereum mainnet: `0x4aaffca65f5f9cbf51abf0f03d11d5f446bdf8e7`
-   BSC mainnet: `0x35df9901e79aca6b920abbb53758ffb3de725af8`
-   Polygon mainnet: `0x59a0a6d73e6a5224871f45e6d845ce1574063ade`

---

## Contributing

See [CONTRIBUTING.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CONTRIBUTING.md)

## Changelog

See [CHANGELOG.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CHANGELOG.md)

---

# Docs

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

## Quick start

```typescript
import {
    LimitOrderBuilder,
    LimitOrderProtocolFacade,
} from '@1inch/limit-order-protocol';

const contractAddress = '0xabc...';
const walletAddress = '0xzxy...';
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
const orderHash: LimitOrderHash = '0xabc...';
const contractAddress = '0xabc...';

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
const contractAddress = '0xabc...';
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

`LimitOrderProtocolFacade.simulateTransferFroms()`

There is the possibility to check limit orders validity.  
For example: you can check that a limit order is valid by predicates.

> **Under the hood:**  
> On a `simulateTransferFroms()` call, the contract returns the string like `TRANSFERS_SUCCESSFUL_01101`  
> If that string contains at least one `0` symbol, then a limit order is invalid, otherwise - valid

### Example:

```typescript
import {LimitOrderProtocolFacade, LimitOrder} from '@1inch/limit-order-protocol';

const contractAddress = '0xabc...';
const order: LimitOrder = {...};

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(contractAddress, connector);

const addresses = [contractAddress];
const callDatas = [order.predicate];

try {
    const result: boolean = await limitOrderProtocolFacade.simulateTransferFroms(addresses, callDatas);

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

const makerAddress = '0xabc...';
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
const contractAddress = '0xabc...';

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
const contractAddress = '0xabc...';

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
const contractAddress = '0xabc...';

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
