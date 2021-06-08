# Cancel a limit order

`LimitOrderProtocolFacade.cancelOrder()`

## Example:

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
