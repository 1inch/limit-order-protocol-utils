<p align="center">
  <img src="https://app.1inch.io/assets/images/logo.svg" width="200" alt="1inch network" />
</p>

# Utils library for 1inch Limit Orders Protocol

This is the package of utilities for working with the `1inch Limit Orders Protocol`

You can find general overview and docs on 1inch limit orders protocol [here](https://docs.1inch.io/limit-order-protocol/).

#### Smart contract addresses

-   Ethereum mainnet: `0x3ef51736315f52d568d6d2cf289419b9cfffe782`
-   BSC mainnet: `0xe3456f4ee65e745a44ec3bcb83d0f2529d1b84eb`
-   Polygon mainnet: `0xb707d89d29c189421163515c59e42147371d6857`
-   Smart contracts source code repository is available [here](https://github.com/1inch/limit-order-protocol)

---

## Test coverage

| Statements                                                                    | Branches                                                                    | Functions                                                                    | Lines                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ![Statements](https://img.shields.io/badge/Coverage-96.85%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-93.15%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-96.08%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-96.85%25-brightgreen.svg) |

## Installation

### Node

```
npm install @1inch/limit-order-protocol
```

### Yarn

```
yarn add @1inch/limit-order-protocol
```

---

## Contributing

See [CONTRIBUTING.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CONTRIBUTING.md)

## Changelog

See [CHANGELOG.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CHANGELOG.md)

---

##About:

Contract allows users to place limit orders, that later could be filled on-chain. Limit order itself is a data structure created off-chain and signed according to EIP-712.

Most probably you would need use following classes:

[LimitOrderBuilder](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order.builder.ts) - to create a limit order  
[LimitOrderPredicateBuilder](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-predicate.builder.ts) - to create a predicate for limit order  
[LimitOrderProtocolFacade](https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-protocol.facade.ts) - to interact with the protocol on the blockchain

Ket features of the protocol is extreme flexibility and high gas efficiency that achieved by using following order types.

## 1. Limit order

A limit order is a financial instrument with which you can put up an ERC-20 token for sale at a fixed price.  
For example, you can put up for sale 2 WBTC tokens at the price of 82415 DAI tokens.

1inch limit orders protocol has many tools for flexible trade management:

-   Partial fill
-   Predicates
-   Single cancellation
-   Bunch cancellation
-   Fullness check
-   Validation

> **Note:** You can create a limit order even if your balance is insufficient to execute the limit order right now. However you must have an allowance for the maker asset.

For market making, there are **RFQ orders** that have special optimization that does not require a large amount of gas for execution.

### Limit orders in the 1inch aggregation protocol

[**1inch aggregation protocol**](https://1inch.io/aggregation-protocol/) - the protocol sources liquidity from various exchanges and is capable of splitting a single trade transaction across multiple DEXes to ensure the best rates.  
You can send your limit orders to the 1inch database and then your order will participate in the 1inch aggregation protocol.

### REST API (swagger):

-   [Ethereum Endpoint](https://limit-orders.1inch.exchange/swagger/ethereum/)
-   [Binance Smart Chain Endpoint](https://limit-orders.1inch.exchange/swagger/binance/)
-   [Polygon Endpoint](https://limit-orders.1inch.exchange/swagger/polygon/)

### Docs

1. [Quick start](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/quick-start.md)
2. [Create a limit order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/create-limit-order.md)
3. [Limit order structure](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/limit-order-structure.md)
4. [Limit order remaining](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/remaining.md)
5. [Nonce](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/nonce.md)
6. [Validate a limit order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/validate-limit-order.md)
7. [Predicate](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/predicate.md)
8. [Fill a limit order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/fill-limit-order.md)
9. [Cancel a limit order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/cancel-limit-order.md)
10. [Cancel all limit orders](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/cancel-all-limit-orders.md)
11. [Domain separator](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/domain-separator.md)

---

## 2. RFQ order

**A request for quotation (RFQ)** is a business process in which a customer requests a quote from a supplier (market maker) for the purchase of some tokens.

> Technically, RFQ orders are a stripped-down version of standard orders, which contains less data and tools to manage, which in turn allows to spend significantly less gas for their execution.

### Docs:

1. [Creating an RFQ order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/create-limit-order-rfq.md)
2. [RFQ order structure](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/limit-order-rfq-structure.md)
3. [Canceling an RFQ order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/cancel-limit-order-rfq.md)
4. [Filling an RFQ order](https://github.com/1inch/limit-order-protocol-utils/blob/master/docs/fill-limit-order-rfq.md)
