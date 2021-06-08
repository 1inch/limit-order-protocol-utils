# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.1](https://github.com/1inch/limit-order-protocol-utils/compare/v0.5.0...v0.5.1) (2021-06-08)

## [0.5.0](https://github.com/1inch/limit-order-protocol-utils/compare/v0.4.0...v0.5.0) (2021-06-08)


### Features

* **limit-order-rfq:** util for create,fill,cancel limit order RFQ ([aa61ed2](https://github.com/1inch/limit-order-protocol-utils/commit/aa61ed24a5f9285902f8d694b198a1ec1aa5bd00))
* RFQ limit orders ([b4a670e](https://github.com/1inch/limit-order-protocol-utils/commit/b4a670ede66ff4de410a4566bf5cef8662becfba))

## [0.4.0](https://github.com/1inch/limit-order-protocol-utils/compare/v0.3.0...v0.4.0) (2021-06-03)


### ⚠ BREAKING CHANGES

* **limit-order-protocol-facade:** LimitOrderProtocolFacade.simulateTransferFroms() renamed to simulateCalls()

### Features

* **limit-order-protocol-facade:** update limit order protocol contracts ([7be31d8](https://github.com/1inch/limit-order-protocol-utils/commit/7be31d8093cc989bacbbef6a9a2f25764885b9ae))

## [0.3.0](https://github.com/1inch/limit-order-protocol-utils/compare/v0.2.1...v0.3.0) (2021-05-20)


### ⚠ BREAKING CHANGES

* **limit-order-protocol-facade:** LimitOrderProtocolFacade.fillOrder() now has one more argument - thresholdAmount, LimitOrderProtocolFacade.nonces() renamed to LimitOrderProtocolFacade.nonce(), LimitOrderProtocolFacade.advanceNonce() now receive argument - nonce increment count - the number to increase the nonce, new method - LimitOrderProtocolFacade.increaseNonce() - increase nonce by 1

### Features

* **limit-order-protocol-facade:** improve errors parsing for simulateTransferFroms() and checkPredicate() ([24e2db8](https://github.com/1inch/limit-order-protocol-utils/commit/24e2db8572b20ed0ece64f6c8153487b2c9d22e6))
* **limit-order-protocol-facade:** update limit order protocol contracts ([5d2d1c6](https://github.com/1inch/limit-order-protocol-utils/commit/5d2d1c6cb1fa34a3b70b74a42c5788de937453b2))

### [0.2.1](https://github.com/1inch/limit-order-protocol-utils/compare/v0.2.0...v0.2.1) (2021-05-15)


### Bug Fixes

* **limit-order-protocol-facade:** improve parseSimulateTransferError() for any errors type ([3c40dac](https://github.com/1inch/limit-order-protocol-utils/commit/3c40daccdb833f6d525f6f2e55fc7d6fad75ecaf))

## [0.2.0](https://github.com/1inch/limit-order-protocol-utils/compare/v0.1.3...v0.2.0) (2021-05-14)


### Features

* **limit-order-builder:** buildOrderSignature() now provides a hash of typed data to providerConnector.signTypedData(walletAddress, typedData, dataHash) ([ebe7479](https://github.com/1inch/limit-order-protocol-utils/commit/ebe7479daba635b893c5d77a51ab363377b33e37))
* **limit-order-protocol-facade:** domainSeparator() for getting hash of domain separator ([3d462cd](https://github.com/1inch/limit-order-protocol-utils/commit/3d462cde6b02e83b61e85d7ad08b43cea3f9ca40))

### [0.1.3](https://github.com/1inch/limit-order-protocol-utils/compare/v0.1.2...v0.1.3) (2021-05-07)


### Bug Fixes

* **limit-order-protocol-facade:** improved parsing of simulate transfer error ([34bb9d3](https://github.com/1inch/limit-order-protocol-utils/commit/34bb9d355c1e0a581f21536b1848af53a90ccb62))

### [0.1.2](https://github.com/1inch/limit-order-protocol-utils/compare/v0.1.1...v0.1.2) (2021-05-04)

### [0.1.1](https://github.com/1inch/limit-order-protocol-utils/compare/v0.1.0...v0.1.1) (2021-05-04)

## [0.1.0](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.7...v0.1.0) (2021-05-01)


### ⚠ BREAKING CHANGES

* **limit-order-predicate-builder:** LimitOrderProtocolFacade now doesn't include methods: andPredicate, timestampBelow, nonceEquals. Use LimitOrderPredicateBuilder instead

### Features

* **limit-order-predicate-builder:** LimitOrderPredicateBuilder for create predicates for limit orders ([881beb0](https://github.com/1inch/limit-order-protocol-utils/commit/881beb0acc50c210befa310d02092e83b346dcbd))

### [0.0.7](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.6...v0.0.7) (2021-04-30)


### Features

* **limit-order-protocol-facade:** improve parsing result of simulateTransferFroms for ethereum mainnet ([69b41ac](https://github.com/1inch/limit-order-protocol-utils/commit/69b41ac54e5ffbe29715652c84dc8c3190fb23da))

### [0.0.6](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.5...v0.0.6) (2021-04-26)


### Features

* **limit-order-protocol-facade:** methods for parse contract response ([ff00a78](https://github.com/1inch/limit-order-protocol-utils/commit/ff00a7809ef56b153500d6fef1d2543944285f24))
* **limit-order-protocol-facade:** methods for parse remaining response ([b3f9912](https://github.com/1inch/limit-order-protocol-utils/commit/b3f99126c1d0ab15e4a2aa63d3e68a591ddfa675))

### [0.0.5](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.4...v0.0.5) (2021-04-26)


### Features

* **limit-order-protocol-facade:** remove unused remainingsRaw() method ([627e084](https://github.com/1inch/limit-order-protocol-utils/commit/627e084b2df6072e920e04e9900a973bd4e60f05))


### Bug Fixes

* **limit-order-protocol-facade:** fix return type of remaining() method ([4cbcc5d](https://github.com/1inch/limit-order-protocol-utils/commit/4cbcc5d1d8254ac1af90085b960746300b680fe8))

### [0.0.4](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.3...v0.0.4) (2021-04-26)

### [0.0.3](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.2...v0.0.3) (2021-04-26)


### Features

* **limit-order-protocol-facade:** simulateTransferFroms() check order validity for filling ([263040c](https://github.com/1inch/limit-order-protocol-utils/commit/263040ce1485afdbcc6a5694c483f26aa73642a5))

### [0.0.2](https://github.com/1inch/limit-order-protocol-utils/compare/v0.0.1...v0.0.2) (2021-04-23)


### Features

* **limit-order-protocol-facade:** checkPredicate() for validate predicates ([e8d2eed](https://github.com/1inch/limit-order-protocol-utils/commit/e8d2eedafb0c04d79e91cb05bc72649a47e70ae7))

### 0.0.1 (2021-04-23)
