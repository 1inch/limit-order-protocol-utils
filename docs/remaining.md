# Limit order remaining

`LimitOrderProtocolFacade.remaining()`

By default, a limit order is created unfilled.  
Until the first fill the `remaining` method will throw error `LOP: Unknown order`.  
After the first fill, the method will return remaining amount.

> Note: a limit order can be partially filled

## Example:

```typescript
import {
    LimitOrderProtocolFacade,
    LimitOrderHash,
} from '@1inch/limit-order-protocol';
import {BigNumber} from 'ethers/utils';

const orderMakerAmount = '400000000000'; // initial amount of the limit order
const orderHash: LimitOrderHash = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';

const connector = new Web3ProviderConnector(new Web3('...'));
const limitOrderProtocolFacade = new limitOrderProtocolFacade(
    contractAddress,
    connector
);

const remaining = await getRemaining(orderHash);

async function getRemaining(orderHash: string): string {
    try {
        const remaining: BigNumber = limitOrderProtocolFacade.remaining(
            orderHash
        );

        return remaining.toString();
    } catch (error) {
        const errorMessage = typeof error === 'string' ? error : error.message;

        if (errorMessage.includes('LOP: Unknown order')) {
            return orderMakerAmount;
        }

        throw error;
    }
}
```
