import { viem } from "hardhat";
import { parseEther } from "viem";

async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, account1, account2] = await viem.getWalletClients();
    
    const tokenContract = await viem.deployContract("MyToken");
    console.log(`Contract deployed at ${tokenContract.address}`);

    
    // Fetching the role code
const code = await tokenContract.read.MINTER_ROLE();

// Giving role
const roleTx = await tokenContract.write.grantRole([
    code,
    account2.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: roleTx });

//MInting tokens
const mintTx = await tokenContract.write.mint(
    [deployer.account.address, parseEther("10")],
    { account: account2.account }
);

//Fetching info in batch
const [name, symbol, decimals, totalSupply] = await Promise.all([
    tokenContract.read.name(),
    tokenContract.read.symbol(),
    tokenContract.read.decimals(),
    tokenContract.read.totalSupply(),
  ]);
  console.log({ name, symbol, decimals, totalSupply });
await publicClient.waitForTransactionReceipt({ hash: mintTx });

}


main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});