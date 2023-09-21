const { network, ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
    const {deployer} = await getNamedAccounts();
    
    let accounts = await ethers.getSigners();
    

    let festivalTicketMarketPlaceAddress = (await deployments.get("FestivalTicketMarketPlace")).address;

    let festivalTicketMarketPlace = await ethers.getContractAt("FestivalTicketMarketPlace", festivalTicketMarketPlaceAddress, accounts[1]);
  
    let buyTicket = await festivalTicketMarketPlace.connect(accounts[0]).buyTicket({ gasLimit: 3000000, value: ethers.utils.parseEther("0.1") });
    buyTicket.wait(1);
    console.log("buyTicket", buyTicket);

    const tokenBalance = await festivalTicketMarketPlace.connect(accounts[0]).getTicketBalanceOfUser(accounts[0].address);

    console.log("tokenBalance", tokenBalance.toString());
    console.log("accounts[0].address", accounts[0].address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


