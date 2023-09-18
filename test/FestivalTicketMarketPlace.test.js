const { assert } = require("chai");
const { network, ethers, run, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip :
    describe("FestivalTicketMarketPlace", function () {

        let accounts;

        let festivalTicketMarketPlace;
        let festivalTicketMarketPlaceAddress;

        let festivalCurrencyTicketAddress;

        let festivalTicketNftAddress;

        let ticketName = networkConfig[network.config.chainId]['ticketName'];
        let ticketSymbol = networkConfig[network.config.chainId]['ticketSymbol'];
        let totalTicket = networkConfig[network.config.chainId]['totalTicket'];
        let ticketPrice = networkConfig[network.config.chainId]['ticketPrice'];


        beforeEach(async function () {
            const {deployer} = await getNamedAccounts();
            accounts = await ethers.getSigners();

            await deployments.fixture(["all"]);

            festivalTicketMarketPlaceAddress = (await deployments.get("FestivalTicketMarketPlace")).address;
            festivalTicketMarketPlace = await ethers.getContractAt("FestivalTicketMarketPlace", festivalTicketMarketPlaceAddress, accounts[0]);

            
            festivalCurrencyTicketAddress = await festivalTicketMarketPlace.getFestivalCurrencyTicketAddress();
            festivalTicketNftAddress = await festivalTicketMarketPlace.getFestivalTicketNFTAddress();

            console.log("accounts: ", accounts);
            festivalTicketMarketPlace.connect(accounts[1]);
            
        });

        describe("MarketPlace-Deployment", function () {
            it("Should set the right ticket name", async function () {
                const tempTicketName = await festivalTicketMarketPlace.getFestivalTicketNFTName();
                assert.equal(tempTicketName, ticketName);
            })
            it("Should set the right ticket symbol", async function () {
                const tempTicketSymbol = await festivalTicketMarketPlace.getFestivalTicketNFTSymbol();
                assert.equal(tempTicketSymbol, ticketSymbol);
            });
            it("Should set the right total ticket", async function () {
                const tempTotalTicket = await festivalTicketMarketPlace.getTotalTickets();
                assert.equal(tempTotalTicket, totalTicket);
            });
            it("Should set the right ticket price", async function () {
                const tempTicketPrice = await festivalTicketMarketPlace.getTicketPrice();
                assert.equal(tempTicketPrice.toString(), ticketPrice.toString());
            });
        });


        /* Buy Ticket */
        describe("MarketPlace-Buy-Ticket", function () {
            it("Successfully buy the ticket", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const ticketId = await festivalTicketMarketPlace.buyTicket({value: price});
                const ticketOwner = await festivalTicketMarketPlace.getFestivalTicketNFTOwnerByTicketId(ticketId);
                console.log("ticketOwner: ", ticketOwner);
            });
        });
    });