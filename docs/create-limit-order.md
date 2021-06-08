# Create a limit order

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

## Example:

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
