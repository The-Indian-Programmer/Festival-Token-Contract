const { assert } = require("chai");
const { network, ethers, run, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip :
    describe("FestivalCurrencyTicket", function () {
        let festivalCurrencyTicket;
        let festivalCurrencyTicketAddress;

        let ticketName = networkConfig[network.config.chainId]['ticketName'];
        let ticketSymbol = networkConfig[network.config.chainId]['ticketSymbol'];
        let totalTicket = networkConfig[network.config.chainId]['totalTicket'];

        beforeEach(async function () {
            const {deployer} = await getNamedAccounts();
            const accounts = await ethers.getSigners();

            await deployments.fixture(["all"]);

            festivalCurrencyTicketAddress = (await deployments.get("FestivalCurrencyTicket")).address;
            festivalCurrencyTicket = await ethers.getContractAt("FestivalCurrencyTicket", festivalCurrencyTicketAddress, accounts[0]);
            
        });

        describe("Deployment", function () {
            it("Should set the right ticket name", async function () {
                assert.equal(await festivalCurrencyTicket.name(), ticketName);
            })
            it("Should set the right ticket symbol", async function () {
                assert.equal(await festivalCurrencyTicket.symbol(), ticketSymbol);
            });
            it("Should set the right total ticket", async function () {
                const totalSupply = await festivalCurrencyTicket.totalSupply();
                assert.equal(totalSupply, totalTicket * 10 ** 18);
            });
        });
    })