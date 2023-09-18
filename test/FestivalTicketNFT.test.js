const { assert } = require("chai");
const { network, ethers, run, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip :
    describe("FestivalTicketNFT", function () {
        let festivalTicketNFT;
        let festivalTicketNFTAddress;

        let ticketName = networkConfig[network.config.chainId]['ticketName'];
        let ticketSymbol = networkConfig[network.config.chainId]['ticketSymbol'];

        beforeEach(async function () {
            const {deployer} = await getNamedAccounts();
            const accounts = await ethers.getSigners();

            await deployments.fixture(["all"]);

            festivalTicketNFTAddress = (await deployments.get("FestivalTicketNFT")).address;
            festivalTicketNFT = await ethers.getContractAt("FestivalTicketNFT", festivalTicketNFTAddress, accounts[0]);
            
        });

        describe("Deployment", function () {
            it("Should set the right ticket name", async function () {
                assert.equal(await festivalTicketNFT.name(), ticketName);
            })
            it("Should set the right ticket symbol", async function () {
                assert.equal(await festivalTicketNFT.symbol(), ticketSymbol);
            });
        });
    });