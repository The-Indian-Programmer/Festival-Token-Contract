// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FestivalTicketNFT is ERC721, Ownable {
    constructor(string memory _ticketName, string memory _ticketSymbol) ERC721(_ticketName, _ticketSymbol) {}


    function mintNFT(address to, uint256 _ticketId) external {
        _safeMint(to, _ticketId);
    }

    /* Approve all the nfts to the marketplace */
    function approveAll(address _to) external onlyOwner {
        setApprovalForAll(_to, true);
    }
}
