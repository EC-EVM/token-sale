import { expect } from "chai";
import { viem } from "hardhat"
import { parseEther, toHex, keccak256 } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const TEST_RATIO = 100n;
const TEST_PRICE = 10n;
const TEST_PURCHASE_SIZE = parseEther("1");
const TEST_RETURN_TOKENS_SIZE = parseEther("50");
const MINTER_ROLE = keccak256(toHex("MINTER_ROLE"));;

  async function deployContractFixture() {
    const publicClient = await viem.getPublicClient()
    const [owner, otherAccount] = await viem.getWalletClients();

    const myTokenContract = await viem.deployContract("MyToken");
    const nftContract = await viem.deployContract("MyNFT");
    const tokenSaleContract = await viem.deployContract("TokenSale", [
      TEST_RATIO,
      TEST_PRICE,
      myTokenContract.address,
      nftContract.address,
    ]);

    // Giving role
    const roleTx = await myTokenContract.write.grantRole([
      MINTER_ROLE,
      tokenSaleContract.address,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: roleTx });

    return {
      publicClient,
      owner,
      otherAccount,
      myTokenContract,
      nftContract,
      tokenSaleContract,
    };
  }
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const ratio = await tokenSaleContract.read.ratio();
      expect(ratio).to.eq(TEST_RATIO);
    })
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const price = await tokenSaleContract.read.price();
      expect(price).to.eq(TEST_PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const paymentTokenAddress = await tokenSaleContract.read.paymentToken();
      const myTokenContract = await viem.getContractAt(
        "MyToken",
        paymentTokenAddress
      )
      const [totalSupply, name, symbol, decimals] = await Promise.all([
        myTokenContract.read.totalSupply(),
        myTokenContract.read.name(),
        myTokenContract.read.symbol(),
        myTokenContract.read.decimals(),
      ])
      expect(totalSupply).to.eq(0n);
      expect(name).to.eq("MyToken");
      expect(symbol).to.eq("MTK");
      expect(decimals).to.eq(18);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      const { tokenSaleContract, otherAccount, publicClient } =
        await loadFixture(deployContractFixture);

      const ethBalanceBefore = await publicClient.getBalance({
        address: otherAccount.account.address
      });

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account,
      });
      const receipt = await publicClient.getTransactionReceipt({
        hash: buyTokensTx
      });

      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const txCost = gasUsed * gasPrice;

      const ethBalanceAfter = await publicClient.getBalance({
        address: otherAccount.account.address
      });

      const diff = ethBalanceBefore - ethBalanceAfter - txCost;
      expect(diff).to.equal(TEST_PURCHASE_SIZE);
    })
    it("gives the correct amount of tokens", async () => {
      const { tokenSaleContract, myTokenContract, otherAccount, publicClient } =
        await loadFixture(deployContractFixture);

      const tokenBalanceBefore = await myTokenContract.read.balanceOf([
        otherAccount.account.address
      ]);

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account,
      });
      await publicClient.waitForTransactionReceipt({
        hash: buyTokensTx
      });

      const tokenBalanceAfter = await myTokenContract.read.balanceOf([
        otherAccount.account.address
      ]);

      const diff = tokenBalanceAfter - tokenBalanceBefore;
      expect(diff).to.equal(TEST_PURCHASE_SIZE * TEST_RATIO);
    });
  })
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    })
    it("burns the correct amount of tokens", async () => {
      const { publicClient, tokenSaleContract, myTokenContract, otherAccount } =
        await loadFixture(deployContractFixture);

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account,
      });
      
      const buyTokensTxReceipt = await publicClient.getTransactionReceipt({
        hash: buyTokensTx
      });

      const tokenBalanceBefore = await myTokenContract.read.balanceOf([
        otherAccount.account.address
      ]);

      const approveTokensTx = await myTokenContract.write.approve(
        [tokenSaleContract.address, TEST_RETURN_TOKENS_SIZE],
        { account: otherAccount.account }
      );
      
      const approveTokensTxReceipt = await publicClient.getTransactionReceipt({
        hash: approveTokensTx
      });

      if (
        !approveTokensTxReceipt.status ||
        approveTokensTxReceipt.status !== "success"
      )
        throw new Error("Transaction failed");

      const returnTokensTx = await tokenSaleContract.write.returnTokens(
        [TEST_RETURN_TOKENS_SIZE],
        { account: otherAccount.account }
      );
      
      const returnTokensTxReceipt = await publicClient.waitForTransactionReceipt({
        hash: returnTokensTx,
      });

      if (
        !returnTokensTxReceipt.status ||
        returnTokensTxReceipt.status !== "success"
      )
        throw new Error("Transaction failed");

      const tokenBalanceAfter = await myTokenContract.read.balanceOf([
        otherAccount.account.address
      ]);

      const diff = tokenBalanceBefore - tokenBalanceAfter;
      expect(diff).to.equal(TEST_RETURN_TOKENS_SIZE);
    });
  })
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
