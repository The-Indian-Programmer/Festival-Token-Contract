const { run } = require("hardhat");
const verify = async (contractAddress, args) => {
    console.log('Verifying contract on Etherscan....');
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.includes('Contract source code already verified')) {
            console.log('Contract source code already verified');
        } else {
            console.log('Error verifying contract:', error);
        }
    }
}

module.exports = { verify } 