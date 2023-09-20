const { network, ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
    console.log("network", network.name);
    const {deployer} = await getNamedAccounts();
    console.log("deployer",deployer);
    
    let accounts = await ethers.getSigners();
    console.log("accounts", accounts[0].address);
    
    // await deployments.fixture(["all"]);

    let festivalTicketMarketPlaceAddress = '0x10E0EE6fd9800aF34c5524736b44c26B713adbA8'
    console.log("festivalTicketMarketPlaceAddress", festivalTicketMarketPlaceAddress);

    let festivalTicketMarketPlace = await ethers.getContractAt("FestivalTicketMarketPlace", festivalTicketMarketPlaceAddress, accounts[1]);
  
    console.log("Before updateCounter");
    let updateCount = await festivalTicketMarketPlace.connect(accounts[0]).updateCounter({ gasLimit: 3000000, value: ethers.utils.parseEther("0.1") });
    updateCount.wait(1);
    console.log("updateCounter", updateCount);
    console.log("After updateCounter");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


