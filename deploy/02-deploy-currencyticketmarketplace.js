const { network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;



    const totalTicket = networkConfig[chainId]['totalTicket'];
    const ticketName = networkConfig[chainId]['ticketName'];
    const ticketSymbol = networkConfig[chainId]['ticketSymbol'];
    const ticketPrice = networkConfig[chainId]['ticketPrice'];

    const args = [
        ticketPrice,
        ticketName,
        ticketSymbol,
        totalTicket,
    ]

    const festivalTicketMarketPlace = await deploy("FestivalTicketMarketPlace", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 6,
    });



    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        verify(festivalTicketMarketPlace.address, args);
    }

    log(`FestivalTicketMarketPlace deployed at ${festivalTicketMarketPlace.address}`);

    // const updateCount = await festivalTicketMarketPlace.updateCounter();
    // updateCount.wait(1);
    // console.log("updateCounter", updateCount);
}

module.exports.tags = ["all", "NftMarketplace"];