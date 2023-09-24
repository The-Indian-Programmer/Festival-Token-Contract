const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;

    let festivalCurrencyTicketAddress;


    const ticketName = networkConfig[chainId]['ticketName'];
    const ticketSymbol = networkConfig[chainId]['ticketSymbol'];
    const totalTicket = networkConfig[chainId]['totalTicket'];

    const args = [totalTicket, ticketName, ticketSymbol];

    const festivalCurrencyTicket = await deploy("FestivalCurrencyTicket", {
        from: deployer,
        log: false,
        args: args,
        waitConfirmations: 6
    });
    festivalCurrencyTicketAddress = festivalCurrencyTicket.address;

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        verify(festivalCurrencyTicket.address, args);
    }

    log(`You have deployed an ERC721 Token contract to ${festivalCurrencyTicket.address}`);
  
};


module.exports.tags = ["all", "festival-ticket"];