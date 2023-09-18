const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");


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
        log: true,
        args: args,
        waitConfirmations: 1
    });
    festivalCurrencyTicketAddress = festivalCurrencyTicket.address;
  
};


module.exports.tags = ["all", "festival-ticket"];