const { run } = require("hardhat");
const verify = async (contractAddress, args) => {
    console.log('Verifying contract on Etherscan....', contractAddress);
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        console.log('Contract verified on Etherscan');
    } catch (error) {
        if (error.message.includes('Contract source code already verified')) {
            console.log('Contract source code already verified');
        } else {
            console.log('Error verifying contract:', error);
        }
    }
}

module.exports = { verify } 