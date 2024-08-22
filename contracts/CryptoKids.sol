// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.7;

contract CryptoKids {
    // write some pseudo code

    // Data types
    // uint amountOfMoney
    // bool isTotal
    // string 'hello'
    // address walletAddress

    // maybe owner Dad
    address owner;

    constructor() {
        owner = msg.sender; 
    }

    struct Kid {
        address walletAddress;
        string firstName;
        string lastName;
        uint releaseTime;
        uint amount;
        bool canWithdraw;
    }

    Kid[] public kids;

    function addKid(address walletAddress, string memory firstName, string memory lastName, uint releaseTime, uint amount, bool canWithdraw) public {
        kids.push(Kid(
            walletAddress,
            firstName,
            lastName,
            releaseTime,
            amount,
            canWithdraw
        ));
    }


    // mapping (string => uint) public kids;


    // define kid onject

    // add kid to the contract

    // deposit funds to the contract, specifically to a kids account

    // kid checks if able to withdraw

    // withdraw money


}