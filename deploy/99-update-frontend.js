const { frontEndTicketContractsFile, frontEndTicketAbiFile, frontEndMarketPlaceContractsFile,frontEndMarketPlaceAbiFile} = require("../helper-hardhat-config")
const fs = require("fs")
const { network, ethers, deployments } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const festivalCurrencyTicketAddress = (await deployments.get("FestivalCurrencyTicket")).address
    const festivalCurrencyTicket = await ethers.getContractAt("FestivalCurrencyTicket", festivalCurrencyTicketAddress)
    fs.writeFileSync(frontEndTicketAbiFile, festivalCurrencyTicket.interface.format(ethers.utils.FormatTypes.json))

    const festivalTicketMarketPlaceAddress = (await deployments.get("FestivalTicketMarketPlace")).address
    const festivalTicketMarketPlace = await ethers.getContractAt("FestivalTicketMarketPlace", festivalTicketMarketPlaceAddress)
    fs.writeFileSync(frontEndMarketPlaceAbiFile, festivalTicketMarketPlace.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const festivalCurrencyTicketAddress = (await deployments.get("FestivalCurrencyTicket")).address
    const festivalCurrencyTicket = await ethers.getContractAt("FestivalCurrencyTicket", festivalCurrencyTicketAddress)
    console.log('fs.readFileSync(frontEndTicketContractsFile, "utf8")', fs.readFileSync(frontEndTicketContractsFile, "utf8"))
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndTicketContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(festivalCurrencyTicket.address)) {
            contractAddresses[network.config.chainId.toString()].push(festivalCurrencyTicket.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [festivalCurrencyTicket.address]
    }
    fs.writeFileSync(frontEndTicketContractsFile, JSON.stringify(contractAddresses))


    const festivalTicketMarketPlaceAddress = (await deployments.get("FestivalTicketMarketPlace")).address
    const festivalTicketMarketPlace = await ethers.getContractAt("FestivalTicketMarketPlace", festivalTicketMarketPlaceAddress)
    const contractAddresses2 = JSON.parse(fs.readFileSync(frontEndMarketPlaceContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses2) {
        if (!contractAddresses2[network.config.chainId.toString()].includes(festivalTicketMarketPlace.address)) {
            contractAddresses2[network.config.chainId.toString()].push(festivalTicketMarketPlace.address)
        }
    } else {
        contractAddresses2[network.config.chainId.toString()] = [festivalTicketMarketPlace.address]
    }
    fs.writeFileSync(frontEndMarketPlaceContractsFile, JSON.stringify(contractAddresses2))
}
module.exports.tags = ["all", "frontend"]
