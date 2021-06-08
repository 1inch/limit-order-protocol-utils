# Canceling a limit order:

It is assumed that limit orders RFQ will be created with a short lifetime.  
But, if it becomes necessary to cancel the created limit order RFQ, then this can be done as follows:

## Parameters:

1. `info` - information about a limit order RFQ (see above in section [Limit order RFQ structure](#Limit-order-RFQ-structure))

## Creating with a typescript/javascript:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrderRFQ
} from '@1inch/limit-order-protocol';

const contractAddress = '0x7643b8c2457c1f36dc6e3b8f8e112fdf6da7698a';
const walletAddress = '0xd337163ef588f2ee7cdd30a3387660019be415c9';

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
const connector = new Web3ProviderConnector(web3);

const limitOrderProtocolFacade = new limitOrderProtocolFacade(
    contractAddress,
    connector
);

const orderRFQ: LimitOrderRFQ = {...};

const callData = limitOrderProtocolFacade.cancelOrderRFQ(orderRFQ.info);

// Send transaction for the limit order RFQ canceling
// Must be implemented
sendTransaction({
    from: walletAddress,
    gas: 50_000, // Set your gas limit
    gasPrice: 600000000, // Set your gas price
    to: contractAddress,
    data: callData,
});
```

## Canceling via CLI (with arguments):

`gasPrice` - in units of GWEI

```shell
npx limit-order-rfq-utils --\
--operation=cancel \
--chainId=56 \
--privateKey={xxx} \
--gasPrice=6 \
--orderInfo=29941961886664662336741887180811
```

## Canceling via CLI (through prompt):

```shell
npx limit-order-rfq-utils
```

As result, you will receive a link to the transaction hash.
