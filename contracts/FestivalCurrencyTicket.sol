/**
 * @title CurrencyToken
 * @dev CurrencyToken is a token that can be used as a currency
 * @dev It is mintable and burnable.
 * @dev It is meant to be used as a currency in the blockchain-contract
 * @dev We will create a fixed amount of tokens and we will mint them to the blockchain-contract
 * @dev The tokens are going to be 1000 and they will be minted to the blockchain-contract
 */

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/* Import External Modules and Libaries */
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";
contract FestivalCurrencyTicket is ERC20 {
    address public owner = msg.sender;
    uint256 private totalTicket;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    constructor(
        uint256 _totalTicket,
        string memory _ticketName,
        string memory _ticketSymbol
    ) ERC20(_ticketName, _ticketSymbol) {
        _mint(msg.sender, _totalTicket);
        totalTicket = _totalTicket;
    }

    function setTokenAllowance(address spender) external onlyOwner {
        _approve(msg.sender, spender, totalTicket);
    }

    function approveToken(address spender, uint256 amount) external {
        _approve(msg.sender, spender, amount);
    }
}
