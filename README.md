# SDK for limit orders protocol

## How to start

Create `LimitOrderContract` instance:
```typescript
const contractAddress = '0xabc...';
const chainId = 1;
const web3 = new Web3();

const limitorderContract = new LimitOrderContract(
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
    limitorderContract: LimitOrderContract;
    walletAddress: string;

    async createOrder(
        makerAssetAddress: string,
        takerAssetAddress: string,
        makerAmount: number,
        takerAmount: number,
        expireTimeSeconds: number
    ): Promise<void> {
        const predicate = await this.buildNewOrderPredicate(expireTimeSeconds);

        const order = this.limitorderContract.buildOrder({
            makerAddress: this.walletAddress,
            makerAssetAddress,
            takerAssetAddress,
            makerAmount: this.tokenAmountToUnits(makerAssetAddress, makerAmount).toString(),
            takerAmount: this.tokenAmountToUnits(takerAssetAddress, takerAmount).toString(),
            predicate
        });

        const typedData = this.limitorderContract.buildOrderTypedData(order);

        const hash = this.limitorderContract.getOrderHash(typedData);

        const signature = await this.limitorderContract.getOrderSignature(this.walletAddress, typedData);

        console.log('New order: ', {order, hash, signature});
    }

    async buildNewOrderPredicate(expireTimeSeconds: number): Promise<string> {
        const timestampBelow = Math.floor(Date.now() / 1000) + expireTimeSeconds;

        const nonce = await this.limitorderContract.nonces(this.walletAddress);

        const noncePredicate = this.limitorderContract.nonceEquals(this.walletAddress, nonce);

        const timestampPredicate = this.limitorderContract.timestampBelow(timestampBelow);

        return this.limitorderContract.andPredicate([
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

        const callData = this.limitorderContract.fillOrder(
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
        if (this.limitorderContract === null) {
            return;
        }

        const {order} = this.getEntity(orderHash);

        const callData = this.limitorderContract.cancelOrder(order);

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
        const callData = this.limitorderContract.advanceNonce();

        this.sendTransaction(callData);
    }
}
```

## Get the remainder of a limit order:
```typescript
class LimitOrderManager {
    async remaining(orderHash: LimitOrderHash): Promise<void> {
        const remaining = await this.limitorderContract.remaining(orderHash);

        console.log('Order remaining', remaining);
    }
}
```
