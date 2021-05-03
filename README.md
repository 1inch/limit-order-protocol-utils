<p align="center">
  <img src="https://app.1inch.io/assets/images/logo.svg" width="200" alt="1inch network" />
</p>

# Utils for limit orders protocol

This is the package of utilities for working with the `1inch limit orders protocol`

[LimitOrderBuilder](./src/limit-order.builder.ts) - to create a limit order  
[LimitOrderPredicateBuilder](./src/limit-order-predicate.builder.ts) - to create a predicates for limit order  
[LimitOrderProtocolFacade](./src/limit-order-protocol.facade.ts) - to interact with the protocol on the blockchain

---

## Test coverage

| Statements                                                                    | Branches                                                                    | Functions                                                                  | Lines                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ![Statements](https://img.shields.io/badge/Coverage-98.94%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-96.83%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-98.94%25-brightgreen.svg) |

## Installation

### Node

```
npm install web3
```

### Yarn

```
yarn install web3
```

## Protocol addresses

-   Ethereum mainnet: `0x94a68df7e81b90a9007db9db7ffb3e6a2f1e6c1b`
-   BSC mainnet: `0x0e6b8845f6a316f92efbaf30af21ff9e78f0008f`

---

## Contents

0. [Quick start](#Quick-start)
1. [Create a limit order](#Create-a-limit-order)
2. [Check a limit order remaining](#Check-a-limit-order-remaining)
3. [Validate a limit order](#Validate-a-limit-order)
4. [Create a predicate for limit order](#Create-a-predicate-for-limit-order)
5. [Check a limit order predicate](#Check-a-limit-order-predicate)
6. [Fill a limit order](#Fill-a-limit-order)
7. [Cancel a limit order](#Cancel-a-limit-order)
8. [Cancel all limit orders](#Cancel-all-limit-orders)
9. [Get the current nonce](#Get-the-current-nonce)

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

// Create a limit order and signature
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

// Fill the limit order
const callData = limitOrderProtocolFacade.fillOrder(
    limitOrder,
    limitOrderSignature,
    '100',
    '0'
);

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

Parameters for creating a limit order:

-   `makerAssetAddress` - address of maker token
-   `takerAssetAddress` - address of taker token
-   `makerAddress` - address of maker
-   `takerAddress` - address of taker. Default: `0x0000000000000000000000000000000000000000`
-   `makerAmount` - amount of maker token, in wei units
-   `takerAmount` - amount of taker token, in wei units
-   `predicate` - predicate call data. Default: `0x`
-   `permit` - permit call data. Default: `0x`
-   `interaction` - interaction call data. Default: `0x`

### Example:

```typescript
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

## Check a limit order remaining

`TODO`

## Validate a limit order

`TODO`

## Create a predicate for limit order

`TODO`

## Check a limit order predicate

`TODO`

## Fill a limit order

`TODO`

## Cancel a limit order

`TODO`

## Cancel all limit orders

`TODO`

## Get the current nonce

`TODO`
