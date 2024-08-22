# Tests for TokenSale.sol

```typescript
Smart Contract Features
Buy ERC20 tokens with ETH for a fixed ratio
Ratio r means that 1 ETH should buy r tokens
Withdraw ETH by burning the ERC20 tokens at the contract
Mint a new ERC721 for a configured price
Price p means that 1 NFT should cost p tokens
Allow users to burn their NFTs to recover half of the purchase price
Update owner withdrawable amount whenever a NFT is sold
Allow owner to withdraw tokens from the contract
Only half of sales value is available for withdraw
Architecture overview
Contract external calls
```

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
