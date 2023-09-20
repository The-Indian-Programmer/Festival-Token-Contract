const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: 'sepolia',
        ticketName: 'FestivalCurrencyTicket',
        ticketSymbol: 'FCT',
        totalTicket: 1000,
        ticketPrice: ethers.utils.parseEther('0.1')
        
    },
    31337: {
        name: 'hardhat',
        ticketName: 'FestivalCurrencyTicket',
        ticketSymbol: 'FCT',
        totalTicket: 1000,
        ticketPrice: ethers.utils.parseEther('0.1')
    },
    1337: {
        name: 'localhost',
        ticketName: 'FestivalCurrencyTicket',
        ticketSymbol: 'FCT',
        totalTicket: 1000,
        ticketPrice: ethers.utils.parseEther('0.1')
    },

} 


const developmentChains = ['hardhat', 'localhost']
const frontEndTicketContractsFile = "../frontend/src/constants/contractAddress/festivalTIcketAddresses.json"
const frontEndTicketAbiFile = "../frontend/src/constants/contractAbi/festivalTicketAbi.json"

const frontEndMarketPlaceContractsFile = "../frontend/src/constants/contractAddress/festivalTIcketMarketPlaceAddresses.json"
const frontEndMarketPlaceAbiFile = "../frontend/src/constants/contractAbi/festivalTicketMarketPlace.json"

module.exports = {
    networkConfig,
    developmentChains,
    frontEndTicketContractsFile,
    frontEndTicketAbiFile,
    frontEndMarketPlaceContractsFile,
    frontEndMarketPlaceAbiFile
}
