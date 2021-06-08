# Domain separator

[Definition of domainSeparator](https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator)

## Example:

```typescript
import {LimitOrderProtocolFacade} from '@1inch/limit-order-protocol';

const domainSeparator = await LimitOrderProtocolFacade.domainSeparator();
```
