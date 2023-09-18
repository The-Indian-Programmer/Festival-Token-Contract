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


module.exports = {
    networkConfig,
    developmentChains,
}
