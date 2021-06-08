# Limit order RFQ structure:

`info` - information about a limit order RFQ, encoded as a decimal number, which contains:

-   the id of the limit order
-   the timestamp of its expiration

Example of generating a limit order RFQ info:

```javascript
const id = 1;
const expiresInTimestamp = 1623166102;
const info = ((BigInt(expiresInTimestamp) << BigInt(64)) | BigInt(id)).toString(
    10
);
```

`makerAsset` - the address of the asset you want to sell (address of a token contract)  
`takerAsset` - the address of the asset you want to buy (address of a token contract)  
`makerAssetData` - the technical info about a maker asset and its amount  
`takerAssetData` - the technical info about a taker asset and its amount
