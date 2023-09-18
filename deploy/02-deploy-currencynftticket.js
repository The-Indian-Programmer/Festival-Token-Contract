const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;

    let festivalTicketNFTAddress;


    const ticketName = networkConfig[chainId]['ticketName'];
    const ticketSymbol = networkConfig[chainId]['ticketSymbol'];

    const args = [ticketName, ticketSymbol];

    const festivalCurrencyTicketNFT = await deploy("FestivalTicketNFT", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: 1
    });
    festivalTicketNFTAddress = festivalCurrencyTicketNFT.address;
  
};


module.exports.tags = ["all", "festival-ticket-nft"];