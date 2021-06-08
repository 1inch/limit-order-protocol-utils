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

For market making, there are **limit orders RFQ** that have special optimization that does not require a large amount of gas for execution.

---

## Limit order docs

0. [Quick start](./docs/quick-start.md)
1. [Create a limit order](./docs/create-limit-order.md)
2. [Limit order remaining](./docs/remaining.md)
3. [Nonce](./docs/nonce.md)
4. [Validate a limit order](./docs/validate-limit-order.md)
5. [Predicate](./docs/predicate.md)
6. [Fill a limit order](./docs/fill-limit-order.md)
7. [Cancel a limit order](./docs/cancel-limit-order.md)
8. [Cancel all limit orders](./docs/cancel-all-limit-orders.md)
9. [Domain separator](./docs/domain-separator.md)

## [Limit order RFQ docs](./docs/limit-order-rfq.md)
