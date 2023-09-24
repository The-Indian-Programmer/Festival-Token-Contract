const { assert, expect } = require("chai");
const { network, ethers, run, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip :
    describe("FestivalTicketMarketPlace", function () {

        let accounts;

        let festivalTicketMarketPlace;
        let festivalTicketMarketPlaceAddress;

        let festivalCurrencyTicket;
        let festivalCurrencyTicketAddress;

        let ticketName = networkConfig[network.config.chainId]['ticketName'];
        let ticketSymbol = networkConfig[network.config.chainId]['ticketSymbol'];
        let totalTicket = networkConfig[network.config.chainId]['totalTicket'];
        let ticketPrice = networkConfig[network.config.chainId]['ticketPrice'];


        beforeEach(async function () {
            const {deployer} = await getNamedAccounts();
            accounts = await ethers.getSigners();

            await deployments.fixture(["all"]);

            festivalTicketMarketPlaceAddress = (await deployments.get("FestivalTicketMarketPlace")).address;
            festivalTicketMarketPlace = await ethers.getContractAt("FestivalTicketMarketPlace", festivalTicketMarketPlaceAddress, accounts[1]);

            
            festivalCurrencyTicketAddress = await festivalTicketMarketPlace.getFestivalCurrencyTicketAddress();
            festivalCurrencyTicket = await ethers.getContractAt("FestivalCurrencyTicket", festivalCurrencyTicketAddress, accounts[1]);

            festivalTicketMarketPlace.connect(accounts[1]);
            festivalCurrencyTicket.connect(accounts[1]);

            
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
                const ticketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                // console.log("ticketId: ", ticketId);
                await ticketTx.wait(1);
                const ticketOwner = await festivalTicketMarketPlace.getFestivalTicketNFTOwnerByTicketId(1);
                assert.equal(ticketOwner, accounts[1].address);
            });
            it("Should revert if price is zero", async function () {
                const price = 0
                await expect(festivalTicketMarketPlace.buyTicket({value: price})).to.be.revertedWith("FestivalTicketMarketPlace__NotSufficientAmount");
            });
            it("Should revert if price is not enough", async function () {
                const price = 1
                await expect(festivalTicketMarketPlace.buyTicket({value: price})).to.be.revertedWith("FestivalTicketMarketPlace__NotSufficientAmount");
            });
            it("Should emit the right event", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const ticketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await expect(ticketTx).to.emit(festivalTicketMarketPlace, "TicketBought").withArgs(accounts[1].address, 1);
            });
            it("After buy ticket, the ticket balance of the user should be 1", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const ticketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await ticketTx.wait(1);
                const ticketBalance = await festivalTicketMarketPlace.getTicketBalanceOfUser(accounts[1].address);
                assert.equal(ticketBalance, 1);
            });
            it("After buy, the user should own the Nft", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const ticketTx = await festivalTicketMarketPlace.connect(accounts[2]).buyTicket({value: price});
                await ticketTx.wait(1);
                const ticketOwner = await festivalTicketMarketPlace.getFestivalTicketNFTOwnerByTicketId(1);
                assert.equal(ticketOwner, accounts[2].address);
            });
        });

        /* listTicketForSale */
        describe("MarketPlace-List-Ticket-For-Sale", function () {
            it("Should revert if ticket is not owned by the caller", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const sellPrice = price * 105 / 100; + price;
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                await expect(festivalTicketMarketPlace.connect(accounts[2]).listTicketForSale(1, price)).to.be.revertedWith("FestivalTicketMarketPlace__NotTicketNFTOwner");
            });
            it("Should revert if new price is zero", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const sellPrice = price * 105 / 100; + price;
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                await expect(festivalTicketMarketPlace.listTicketForSale(1, 0)).to.be.revertedWith("FestivalTicketMarketPlace__PriceCannotBeZero");
            });
            it("Should revert if new price more than 110 of old price", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                let sellPrice = price * 111 / 100; + price;
                sellPrice = ethers.utils.parseEther(sellPrice.toString());
                
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                expect(festivalTicketMarketPlace.listTicketForSale(1, sellPrice)).to.be.revertedWith("FestivalTicketMarketPlace__NewPriceNotMoreThan10Percent()");
            });
            it("Only ticket owner can list ticket for sale", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const sellPrice = price * 105 / 100; + price;
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                festivalTicketMarketPlace.connect(accounts[1]);
                expect(festivalTicketMarketPlace.listTicketForSale(1, sellPrice)).to.be.revertedWith("FestivalTicketMarketPlace__NotTicketNFTOwner()");
            });
            it("Cannot list ticket with price zero", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const sellPrice = 0;
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                expect(festivalTicketMarketPlace.listTicketForSale(1, sellPrice)).to.be.revertedWith("FestivalTicketMarketPlace__PriceCannotBeZero");
            })
            it("Can not list if already listed", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                await festivalTicketMarketPlace.listTicketForSale(1, price);
                expect(festivalTicketMarketPlace.listTicketForSale(1, price)).to.be.revertedWith("FestivalTicketMarketPlace__TicketAlreadyListed");
            });
        });


        /* Cancel Listing */
        describe("MarketPlace-Cancel-Listing", function () {

            it("Should revert if ticket is not owned by the caller", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                await expect(festivalTicketMarketPlace.connect(accounts[2]).cancelTicketListing(1)).to.be.revertedWith("FestivalTicketMarketPlace__NotTicketNFTOwner");
            });
            it("Should revert if ticket is not listed", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                await expect(festivalTicketMarketPlace.cancelTicketListing(1)).to.be.revertedWith("FestivalTicketMarketPlace__TicketNotListedToSale");
            });
            it("Successfully cancel the ticket", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                await festivalTicketMarketPlace.listTicketForSale(1, price);
                await festivalTicketMarketPlace.cancelTicketListing(1);
                const ticketListing = await festivalTicketMarketPlace.getTicketListing();
                assert.equal(ticketListing[0].ticketId, 0);
            });
        });

        /* updateTicketPrice */
        describe("MarketPlace-Update-Ticket-Price", function () {
            it("Should revert if ticket is not owned by the caller", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                await expect(festivalTicketMarketPlace.connect(accounts[2]).updateTicketPrice(1, price)).to.be.revertedWith("FestivalTicketMarketPlace__NotTicketNFTOwner");
            });
            it("Should revert if ticket is not listed", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                await expect(festivalTicketMarketPlace.updateTicketPrice(1, price)).to.be.revertedWith("FestivalTicketMarketPlace__TicketNotListedToSale");
            });
            it("Should revert if new price is zero", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const newPrice = 0;
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                await festivalTicketMarketPlace.listTicketForSale(1, price);
                await expect(festivalTicketMarketPlace.updateTicketPrice(1, newPrice)).to.be.revertedWith("FestivalTicketMarketPlace__PriceCannotBeZero");
            });
            it("Should revert if new price more than 110 of old price", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                let newPrice = price * 111 / 100; + price;
                newPrice = ethers.utils.parseEther(newPrice.toString());

                
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                await festivalTicketMarketPlace.listTicketForSale(1, price);

                await expect(festivalTicketMarketPlace.updateTicketPrice(1, newPrice)).to.be.revertedWith("FestivalTicketMarketPlace__NewPriceNotMoreThan10Percent");
            });
            it("Successfully update the ticket price", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                let newPrice = price * 105 / 100; + price;

                newPrice = newPrice.toString();

                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                await festivalTicketMarketPlace.listTicketForSale(1, price);

                await festivalTicketMarketPlace.updateTicketPrice(1, newPrice);
                const ticketListing = await festivalTicketMarketPlace.getTicketListing();
                assert.equal(ticketListing[0].ticketId, 1);
                assert.equal(ticketListing[0].price.toString(), newPrice.toString());
            });
        });


        /* buyTicketFromListing */
        describe("MarketPlace-Buy-Ticket-From-Listing", function () {


            beforeEach(async function () {
                /* Buy and list the nft ticket first */
                console.log("=============================================================")
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);
                console.log("Ticket Owner: ", accounts[1].address)

                let newPrice = price * 105 / 100; + price;
                newPrice =newPrice.toString();

                const approveTicketTx = await festivalCurrencyTicket.approveToken(festivalTicketMarketPlaceAddress, 1);
                await approveTicketTx.wait(1);

                await festivalTicketMarketPlace.listTicketForSale(1, newPrice);
            });

            it("Should revert if ticket is not listed", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                let newPrice = price * 105 / 100; + price;
                newPrice =newPrice.toString();
                await expect(festivalTicketMarketPlace.buyTicketFromListing(2, {value: newPrice})).to.be.revertedWith("FestivalTicketMarketPlace__TicketNotListedToSale");
            });
            it("Should revert if price is not enough", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                
                let newPrice = price * 104 / 100; + price; 
                newPrice = newPrice.toString();

                await expect(festivalTicketMarketPlace.connect(accounts[2]).buyTicketFromListing(1, {value: newPrice})).to.be.revertedWith("FestivalTicketMarketPlace__NotSufficientAmount");

            });
            it("Ticket owner can not buy the ticket from listing", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                let newPrice = price * 105 / 100; + price;
                newPrice = newPrice.toString();

                await expect(festivalTicketMarketPlace.buyTicketFromListing(1, {value: newPrice})).to.be.revertedWith("FestivalTicketMarketPlace__AlreadyTicketOwner");
            });
            it("Successfully buy the ticket from listing", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                console.log("MarketPlace Address: ", festivalTicketMarketPlaceAddress)
                console.log("Ticket Addresss: ", festivalCurrencyTicketAddress)
                console.log("=============================================================")

                console.log("Account one: ", accounts[1].address)
                console.log("Account two: ", accounts[2].address)
                
                
                let newPrice = price * 105 / 100; + price;

                newPrice = newPrice.toString();

                const ticketOwnerBefore = await festivalTicketMarketPlace.getFestivalTicketNFTOwnerByTicketId(1);
                console.log("Ticket Owner Before: ", ticketOwnerBefore)
                const buyTicketFromListingTx = await festivalTicketMarketPlace.connect(accounts[2]).buyTicketFromListing(1, {value: newPrice});
                await buyTicketFromListingTx.wait(1);

                
                const ticketOwner = await festivalTicketMarketPlace.getFestivalTicketNFTOwnerByTicketId(1);
                console.log("Ticket Owner After: ", ticketOwner)
                assert.equal(ticketOwner, accounts[2].address);
            });
        });

        /* withdrawBalance */
        describe("MarketPlace-Withdraw-Balance", function () {
            it("Should revert if balance is zero", async function () {
                await expect(festivalTicketMarketPlace.withdrawBalance()).to.be.revertedWith("FestivalTicketMarketPlace__NotHaveSufficientAmount");
            });
            it("Successfully withdraw the balance", async function () {
                const price = await festivalTicketMarketPlace.getTicketPrice();
                const buyTicketTx = await festivalTicketMarketPlace.buyTicket({value: price});
                await buyTicketTx.wait(1);

                let newPrice = price * 105 / 100; + price;
                newPrice =newPrice.toString();

                const approveTicketTx = await festivalCurrencyTicket.approveToken(festivalTicketMarketPlaceAddress, 1);
                await approveTicketTx.wait(1);

                await festivalTicketMarketPlace.listTicketForSale(1, newPrice);

                const buyTicketTx2 =  await festivalTicketMarketPlace.connect(accounts[2]).buyTicketFromListing(1, {value: newPrice});
                await buyTicketTx2.wait(1);

                const balance = await festivalTicketMarketPlace.getBalanceOfSeller(accounts[1].address);
                
                const withdrawBalanceTx = await festivalTicketMarketPlace.connect(accounts[1]).withdrawBalance();
                console.log({withdrawBalanceTx})

            });
        });

    });