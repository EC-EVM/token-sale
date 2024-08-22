// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from  "@openzeppelin/contracts/access/Ownable.sol";
import {MyToken} from "./MyERC20.sol";
import {MyNFT} from "./MyERC721.sol";

contract TokenSale is Ownable {

        uint256 public ratio;
        uint256 public price;
        MyToken public paymentToken;
        MyNFT public nftContract;

        constructor(uint256 _ratio, uint256 _price, MyToken _paymentToken, MyNFT _nftContract) Ownable(msg.sender) {
            ratio = _ratio;
            price = _price;
            paymentToken = _paymentToken;
            nftContract = _nftContract;
        }

        function buyTokens() external payable {
            paymentToken.mint(msg.sender, msg.value*ratio);
        }

        function returnTokens(uint256 amount) external {
            paymentToken.burnFrom(msg.sender, amount);
            payable(msg.sender).transfer(amount / ratio);
            // Taken tokens inside
        }
}