// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FestivalCurrencyTicket.sol";
/* Library Imports */
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import 'hardhat/console.sol';
contract FestivalTicketMarketPlace is ERC721, Ownable, ReentrancyGuard {

    /* Structs */
    struct TicketListing {
        uint256 ticketId;
        address seller;
        uint256 price;
    } 
    
    /* State Vars */
    FestivalCurrencyTicket public festivalCurrencyTicket;
    uint256 public ticketPrice;
    uint256 public ticketSold = 0;
    uint256 private immutable maxTickets;
    string private  ticketName;
    string private ticketSymbol;
    TicketListing[] public ticketListings;
    address private contractOwner;


    /* Constructor */
    constructor(uint256 _ticketPrice, string memory _ticketName, string memory _ticketSymbol, uint256 _totalTicket) ERC721(_ticketName, _ticketSymbol) {
        festivalCurrencyTicket = new FestivalCurrencyTicket(_totalTicket, _ticketName, _ticketSymbol);
        ticketPrice = _ticketPrice;
        maxTickets = _totalTicket;
        ticketName = _ticketName;
        ticketSymbol = _ticketSymbol;
        contractOwner = msg.sender;
        festivalCurrencyTicket.setTokenAllowance(address(this));
    } 

    

     /* Mappings */
    // 1. Mapping from token ID to ticket price
    mapping (uint256 => uint256) ticketPriceByTicketId;
    // 2. seller => balance
    mapping(address => uint256) private s_balances; 


      /* Errors */
    error FestivalTicketMarketPlace__NoMoreTicketsAvailable();
    error FestivalTicketMarketPlace__TokenTransferFailed();
    error FestivalTicketMarketPlace__NotSufficientAmount();
    error FestivalTicketMarketPlace__NotTicketNFTOwner(uint256 tokenId);
    error FestivalTicketMarketPlace__NewPriceNotMoreThan10Percent();
    error FestivalTicketMarketPlace__PriceCannotBeZero();
    error FestivalTicketMarketPlace__NftNotApprovedForMarketPlace();
    error FestivalTicketMarketPlace__TicketNotListedToSale();
    error FestivalTicketMarketPlace__AlreadyTicketOwner(uint256 tokenId);
    error FestivalTicketMarketPlace__NotHaveSufficientAmount(address seller);
    error FestivalTicketMarketPlace__WithDrawFailed(address seller, uint256 amount);
    error FestivalTicketMarketPlace__TicketAlreadyListed(uint256 tokenId);


    /* Modifiers */
    modifier onlyTicketOwner(uint256 _ticketId) {
        // if (festivalTicketNFT.ownerOf(_ticketId) != msg.sender) revert FestivalTicketMarketPlace__NotTicketNFTOwner(_ticketId);
        if (ownerOf(_ticketId) != msg.sender) revert FestivalTicketMarketPlace__NotTicketNFTOwner(_ticketId);
        _;
    }

    modifier notOwnerOfNFTTicket (uint256 ticketId, address seller) {
        if (ownerOf(ticketId) != seller) revert FestivalTicketMarketPlace__NotTicketNFTOwner(ticketId);
        _;
    }
    

    modifier newPriceNotMoreThan10Percent(uint256 _ticketId, uint256 _newPrice) {
        uint256 oldPrice = ticketPriceByTicketId[_ticketId];
        uint256 tenPercentOfOldPrice = oldPrice / 10;
        uint256 maxPrice = oldPrice + tenPercentOfOldPrice;
        if (_newPrice > maxPrice) revert FestivalTicketMarketPlace__NewPriceNotMoreThan10Percent();
        _;
    }

    /* Internal Functions */
    function alreadyTicketNFTListed (uint256 _ticketId) internal view returns (bool) {
        uint256 newTicketId;
        for (uint i = 0; i < ticketListings.length; i++) {
            if (ticketListings[i].ticketId == _ticketId) {
                newTicketId = ticketListings[i].ticketId;
            }
        }
        if (newTicketId != 0) {
            return true;
        } else {
            return false;
        }
    }

    /* Events */
    event TicketBought(address indexed buyer, uint256 indexed ticketId);
    event TicketListed(uint256 indexed ticketId, address indexed seller, uint256 price);
    event TicketRemoved(uint256 indexed ticketId, address indexed seller, uint256 price);
    event TicketUpdated(uint256 indexed ticketId, address indexed seller, uint256 price);
    event AmountWithDrawn(address indexed seller, uint256 amount);

    

    function buyTicket() external payable returns (uint256 ticketId){
        if (ticketSold >= maxTickets) revert FestivalTicketMarketPlace__NoMoreTicketsAvailable();
        if (msg.value != ticketPrice) revert FestivalTicketMarketPlace__NotSufficientAmount();
        uint256 ticketToTransfer = 1;
        bool isTransferSuccessful = festivalCurrencyTicket.transferFrom(address(this), msg.sender , ticketToTransfer);
        if (!isTransferSuccessful) revert FestivalTicketMarketPlace__TokenTransferFailed();        
        ticketId = ticketSold + 1;
        ticketSold++;
        ticketPriceByTicketId[ticketId] = ticketPrice;
        // festivalTicketNFT.mintNFT(msg.sender, ticketId);
        _mint(msg.sender, ticketId);
        emit TicketBought(msg.sender, ticketId);
        return ticketId;
    }  


    /* Function to l3ist the ticket for sale */
    function listTicketForSale(uint256 _ticketId, uint256 _price) external onlyTicketOwner(_ticketId) notOwnerOfNFTTicket(_ticketId, msg.sender) newPriceNotMoreThan10Percent(_ticketId, _price)  {
        if (_price <= 0) revert FestivalTicketMarketPlace__PriceCannotBeZero();
        if (alreadyTicketNFTListed(_ticketId)) revert FestivalTicketMarketPlace__TicketAlreadyListed(_ticketId);

    

        IERC20 ticket = IERC20(address(festivalCurrencyTicket));
        uint256 balanceOfBefore = ticket.balanceOf(msg.sender);
        console.log("balanceOfAfter", balanceOfBefore);


        uint256 allow = ticket.allowance(msg.sender, address(this));
        console.log("allow", allow);

        uint256 balanceOfAfter = ticket.balanceOf(msg.sender);
        console.log("balanceOfAfter", balanceOfAfter);
        
        // IERC721 nft = IERC721(address(this));
        // if (nft.getApproved(_ticketId) != address(this)) revert FestivalTicketMarketPlace__NftNotApprovedForMarketPlace();
        // TicketListing memory ticketListing = TicketListing(_ticketId, msg.sender, _price);
        // ticketListings.push(ticketListing);
        emit TicketListed(_ticketId, msg.sender, _price);
    }

    /* Function to cancel the ticket from listing */
    function cancelTicketListing(uint256 _ticketId) external onlyTicketOwner(_ticketId) notOwnerOfNFTTicket(_ticketId, msg.sender) {
        if (!alreadyTicketNFTListed(_ticketId)) revert FestivalTicketMarketPlace__TicketNotListedToSale();
        for (uint256 i = 0; i < ticketListings.length; i++) {
            if (ticketListings[i].ticketId == _ticketId) {
                delete ticketListings[i];
                break;
            }
        }
        emit TicketRemoved(_ticketId, msg.sender, 0);
    }

    /* Function to update the ticket price from listing */
    function updateTicketPrice(uint256 _ticketId, uint256 _newPrice) external onlyTicketOwner(_ticketId) notOwnerOfNFTTicket(_ticketId, msg.sender) newPriceNotMoreThan10Percent(_ticketId, _newPrice) {
        if (_newPrice <= 0) revert FestivalTicketMarketPlace__PriceCannotBeZero();
        if (!alreadyTicketNFTListed(_ticketId)) revert FestivalTicketMarketPlace__TicketNotListedToSale();
        for (uint256 i = 0; i < ticketListings.length; i++) {
            if (ticketListings[i].ticketId == _ticketId) {
                ticketListings[i].price = _newPrice;
                break;
            }
        }
        emit TicketUpdated(_ticketId, msg.sender, _newPrice);
    }

    /* Function to buy the ticket for user from listing */
    function buyTicketFromListing(uint256 _ticketId) external payable {
        if (msg.value == 0) revert FestivalTicketMarketPlace__NotSufficientAmount();
        
        uint256 price;
        address seller;
        for (uint i = 0; i < ticketListings.length; i++) {
            if (ticketListings[i].ticketId == _ticketId) {
                price = ticketListings[i].price;
                seller = ticketListings[i].seller;
            }
        }
        if (price == 0) revert FestivalTicketMarketPlace__TicketNotListedToSale();
        if (seller == msg.sender) revert FestivalTicketMarketPlace__AlreadyTicketOwner(_ticketId);
        if (msg.value != price) revert FestivalTicketMarketPlace__NotSufficientAmount();

        

address spender  = address(this);
// address owner = msg.sender;

// festivalCurrencyTicket.approve(spender, 1);

        // bool isTransferSuccessful = festivalCurrencyTicket.transfer(msg.sender, 1);

        bool isTransferSuccessful = festivalCurrencyTicket.transferFrom(seller, msg.sender, 1);
        console.log("isTransferSuccessful", isTransferSuccessful);

        // if (!isTransferSuccessful) revert FestivalTicketMarketPlace__TokenTransferFailed();
        IERC721 nft = IERC721(address(this));
        nft.safeTransferFrom(seller, msg.sender, _ticketId);
        for (uint256 i = 0; i < ticketListings.length; i++) {
            if (ticketListings[i].ticketId == _ticketId) {
                delete ticketListings[i];
                break;
            }
        }
        s_balances[seller] += price;
        emit TicketBought(msg.sender, _ticketId);
    }


    /* Function to withdraw the balance from the contract */
    function withdrawBalance() external returns (bool) {
        uint256 amount = s_balances[msg.sender];
        if (amount <= 0) revert FestivalTicketMarketPlace__NotHaveSufficientAmount(msg.sender);

        s_balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert FestivalTicketMarketPlace__WithDrawFailed(msg.sender, amount);
        emit AmountWithDrawn(msg.sender, amount);
        return true;
    }

    /* ------------------------------- Getter Functions ------------------------------- */
    /* Function to get total sold tickets */
    function getTotalSoldTickets() external view returns (uint256) {
        return ticketSold;
    }

    /* Function to get total tickets */
    function getTotalTickets() external view returns (uint256) {
        return maxTickets;
    }

    /* Function to get ticket price */
    function getTicketPrice() external view returns (uint256) {
        return ticketPrice;
    }

    /* Function to get ticket price by ticket id */
    function getTicketPriceByTicketId(uint256 _ticketId) external view returns (uint256) {
        return ticketPriceByTicketId[_ticketId];
    }

    /* Function to get ticket listing by ticket id */
    function getTicketListing() external view returns (TicketListing[] memory) {
        return ticketListings;
    }

    /* Function to get balance of the seller */
    function getBalanceOfSeller(address seller) external view returns (uint256) {
        return s_balances[seller];
    }

    /* Function to get balance of the contract */
    function getBalanceOfContract() external view returns (uint256) {
        return address(this).balance;
    }

    /* Function to get the Festival Marketplace Address */
    function getFestivalMarketPlaceAddress() external view returns (address) {
        return address(this);
    }


    /* Function to get the Festival Currency Ticket Address */
    function getFestivalCurrencyTicketAddress() external view returns (address) {
        return address(festivalCurrencyTicket);
    }


    /* Function to get the ticket price */
    function getFestivalTicketNFTPrice(uint256 _ticketId) external view returns (uint256) {
        uint256 price;
        for (uint256 i = 0; i < ticketListings.length; i++) {
            if (ticketListings[i].ticketId == _ticketId) {
                price = ticketListings[i].price;
            }
        }
        if (price == 0) {
            return ticketPrice;
        } else {
            return price;
        }
    }

    /* Function to get the ticket owner by ticket id*/
    function getFestivalTicketNFTOwnerByTicketId(uint256 _ticketId) external view returns (address) {
        return ownerOf(_ticketId);
    }

    /* Function to get the ticket name */
    function getFestivalTicketNFTName() external view returns (string memory) {
        return ticketName;
    }

    /* Function to get the ticket symbol */
    function getFestivalTicketNFTSymbol() external view returns (string memory) {
        return ticketSymbol;
    }

    /* Function to get owner */
    function getOwner() external view returns (address) {
        return contractOwner;
    }

    /* Get token balance of user */
    function getTicketBalanceOfUser(address user) external view returns (uint256) {
        return festivalCurrencyTicket.balanceOf(user);
    }

    
    
    
}
