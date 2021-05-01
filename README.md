# Utils for limit orders protocol

## How to start

Create `LimitOrderProtocolFacade` instance:

```typescript
const contractAddress = '0xabc...';
const chainId = 1;
const web3 = new Web3();

const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
    contractAddress,
    chainId,
    new Web3ProviderConnector(web3)
);
```

**Note:** you can use any implementation for the provider.  
Just implement `ProviderConnector` interface:

```typescript
class MyProviderConnector implements ProviderConnector {
    //...
}
```

## Create a limit order predicate

```typescript
class LimitOrderManager {
    limitOrderProtocolFacade: LimitOrderProtocolFacade;
    walletAddress: string;

    buildLimitOrderPredicate(): void {
        const nonce = 15;
        const timestampBelow = 1619860038;

        const predicateBuilder = new LimitOrderPredicateBuilder(
            this.limitOrderProtocolFacade
        );

        const predicate = predicateBuilder.and(
            predicateBuilder.nonceEquals(this.walletAddress, nonce),
            predicateBuilder.timestampBelow(timestampBelow)
        );

        console.log(predicate);
    }
}
```

## Create a limit order

```typescript
class LimitOrderManager {
    limitOrderProtocolFacade: LimitOrderProtocolFacade;
    walletAddress: string;

    async createOrder(
        makerAssetAddress: string,
        takerAssetAddress: string,
        makerAmount: number,
        takerAmount: number,
        expireTimeSeconds: number
    ): Promise<void> {
        const predicate = await this.buildNewOrderPredicate(expireTimeSeconds);

        /**
         * Note: you can pass takerAddress, by default it set to 0x0000000000000000000000000000000000000000
         */
        const order = this.limitOrderProtocolFacade.buildOrder({
            makerAddress: this.walletAddress,
            makerAssetAddress,
            takerAssetAddress,
            makerAmount: this.tokenAmountToUnits(
                makerAssetAddress,
                makerAmount
            ).toString(),
            takerAmount: this.tokenAmountToUnits(
                takerAssetAddress,
                takerAmount
            ).toString(),
            predicate,
        });

        const typedData = this.limitOrderProtocolFacade.buildOrderTypedData(
            order
        );

        const hash = this.limitOrderProtocolFacade.getOrderHash(typedData);

        const signature = await this.limitOrderProtocolFacade.getOrderSignature(
            this.walletAddress,
            typedData
        );

        console.log('New order: ', {order, hash, signature});
    }

    async buildNewOrderPredicate(expireTimeSeconds: number): Promise<string> {
        const timestampBelow =
            Math.floor(Date.now() / 1000) + expireTimeSeconds;

        const nonce = await this.limitOrderProtocolFacade.nonces(
            this.walletAddress
        );

        const noncePredicate = this.limitOrderProtocolFacade.nonceEquals(
            this.walletAddress,
            nonce
        );

        const timestampPredicate = this.limitOrderProtocolFacade.timestampBelow(
            timestampBelow
        );

        return this.limitOrderProtocolFacade.andPredicate([
            noncePredicate,
            timestampPredicate,
        ]);
    }
}
```

## Fill a limit order:

```typescript
class LimitOrderManager {
    getEntity(
        orderHash: LimitOrderHash
    ): {order: LimitOrder; signature: LimitOrderSignature} {
        // Get limit order by hash
    }

    tokenAmountToUnits(tokenAddress: string, amount: number): string {
        // Format token amount to units
    }

    sendTransaction(callData: string): void {
        // Send transaction to blockchain
    }

    fillOrder(
        orderHash: LimitOrderHash,
        makerAmount: number,
        takerAmount: number
    ): void {
        const {order, signature} = this.getEntity(orderHash);

        const callData = this.limitOrderProtocolFacade.fillOrder(
            order,
            signature,
            this.tokenAmountToUnits(order.makerAsset, makerAmount),
            this.tokenAmountToUnits(order.takerAsset, takerAmount)
        );

        this.sendTransaction(callData);
    }
}
```

## Cancel a limit order:

```typescript
class LimitOrderManager {
    getEntity(
        orderHash: LimitOrderHash
    ): {order: LimitOrder; signature: LimitOrderSignature} {
        // Get limit order by hash
    }

    sendTransaction(callData: string): void {
        // Send transaction to blockchain
    }

    cancelOrder(orderHash: LimitOrderHash): void {
        const {order} = this.getEntity(orderHash);

        const callData = this.limitOrderProtocolFacade.cancelOrder(order);

        this.sendTransaction(callData);
    }
}
```

## Cancel all orders:

```typescript
class LimitOrderManager {
    sendTransaction(callData: string): void {
        // Send transaction to blockchain
    }

    cancelAllOrders(): void {
        const callData = this.limitOrderProtocolFacade.advanceNonce();

        this.sendTransaction(callData);
    }
}
```

## Get the remainder of a limit order:

```typescript
class LimitOrderManager {
    async remaining(orderHash: LimitOrderHash): Promise<void> {
        const remaining = await this.limitOrderProtocolFacade.remaining(
            orderHash
        );

        console.log('Order remaining', remaining);
    }
}
```

## Validate order:

### Validate by simulateTransferFroms:

```typescript
class LimitOrderManager {
    walletAddress: string;

    getEntity(
        orderHash: LimitOrderHash
    ): {order: LimitOrder; signature: LimitOrderSignature} {
        // Get limit order by hash
    }

    simulateTransferFroms(orderHash: LimitOrderHash): void {
        const {order} = this.getEntity(orderHash);
        const {contractAddress} = limitOrderProtocolFacade;

        const tokens = [contractAddress, this.walletAddress];
        const data = [order.predicate, order.makerAssetData];

        const isValid = this.limitOrderProtocolFacade.simulateTransferFroms(
            tokens,
            data
        );

        console.log(isValid);
    }
}
```
