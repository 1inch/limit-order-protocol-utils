# Utils for limit orders protocol

## How to start

Create `LimitOrderProtocolUtils` instance:
```typescript
const contractAddress = '0xabc...';
const chainId = 1;
const web3 = new Web3();

const limitOrderProtocolUtils = new LimitOrderProtocolUtils(
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

## Create a limit order
```typescript
class LimitOrderManager {
    limitOrderProtocolUtils: LimitOrderProtocolUtils;
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
        const order = this.limitOrderProtocolUtils.buildOrder({
            makerAddress: this.walletAddress,
            makerAssetAddress,
            takerAssetAddress,
            makerAmount: this.tokenAmountToUnits(makerAssetAddress, makerAmount).toString(),
            takerAmount: this.tokenAmountToUnits(takerAssetAddress, takerAmount).toString(),
            predicate
        });

        const typedData = this.limitOrderProtocolUtils.buildOrderTypedData(order);

        const hash = this.limitOrderProtocolUtils.getOrderHash(typedData);

        const signature = await this.limitOrderProtocolUtils.getOrderSignature(this.walletAddress, typedData);

        console.log('New order: ', {order, hash, signature});
    }

    async buildNewOrderPredicate(expireTimeSeconds: number): Promise<string> {
        const timestampBelow = Math.floor(Date.now() / 1000) + expireTimeSeconds;

        const nonce = await this.limitOrderProtocolUtils.nonces(this.walletAddress);

        const noncePredicate = this.limitOrderProtocolUtils.nonceEquals(this.walletAddress, nonce);

        const timestampPredicate = this.limitOrderProtocolUtils.timestampBelow(timestampBelow);

        return this.limitOrderProtocolUtils.andPredicate([
            noncePredicate,
            timestampPredicate
        ]);
    }
}
```

## Fill a limit order:
```typescript
class LimitOrderManager {
    getEntity(orderHash: LimitOrderHash): {order: LimitOrder, signature: LimitOrderSignature} {
        // Get limit order by hash
    }

    tokenAmountToUnits(tokenAddress: string, amount: number): string {
        // Format token amount to units
    }

    sendTransaction(callData: string): void {
        // Send transaction to blockchain
    }

    fillOrder(orderHash: LimitOrderHash, makerAmount: number, takerAmount: number): void {
        const {order, signature} = this.getEntity(orderHash);

        const callData = this.limitOrderProtocolUtils.fillOrder(
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
    getEntity(orderHash: LimitOrderHash): {order: LimitOrder, signature: LimitOrderSignature} {
        // Get limit order by hash
    }

    sendTransaction(callData: string): void {
        // Send transaction to blockchain
    }

    cancelOrder(orderHash: LimitOrderHash): void {
        if (this.limitOrderProtocolUtils === null) {
            return;
        }

        const {order} = this.getEntity(orderHash);

        const callData = this.limitOrderProtocolUtils.cancelOrder(order);

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
        const callData = this.limitOrderProtocolUtils.advanceNonce();

        this.sendTransaction(callData);
    }
}
```

## Get the remainder of a limit order:
```typescript
class LimitOrderManager {
    async remaining(orderHash: LimitOrderHash): Promise<void> {
        const remaining = await this.limitOrderProtocolUtils.remaining(orderHash);

        console.log('Order remaining', remaining);
    }
}
```
