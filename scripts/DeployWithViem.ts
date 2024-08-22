import { viem } from "hardhat";
import { parseEther } from "viem";
import * as dotenv from "dotenv";
import { sepolia } from "viem/chains";
import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { abi, bytecode } from "../artifacts/contracts/MyERC20.sol/MyToken.json";


dotenv.config();

const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
    // npx ts-node --files ./scripts/DeployWithViem.ts
    // Create public client to connect with sepolia using Alchemy
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);
    
    // Connect the wallet account that we're going to deploy with
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
      account,
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({
      address: deployer.account.address,
    });

    // Deploying the contract on Sepolia network
    console.log("\nDeploying Ballot contract");
    const hash = await deployer.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Ballot contract deployed to:", receipt.contractAddress);

    
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});