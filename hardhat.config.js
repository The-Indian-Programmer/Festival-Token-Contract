require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

let { LOCALHOST_PRIVATE_KEY, LOCALHOST_RPC_URL, SEPOLIA_RPC_URL, PRIVATE_KEY, PRIVATE_KEY_PASSWORD, ETHERSCAN_API_KEY, COINMARKETCAP_API_KEY, LOCALHOST_PRIVATE_KEY_TWO, LOCALHOST_PRIVATE_KEY_THREE } = process.env;

module.exports = {
  defaultNetwork: "hardhat",

  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.6.6",
      }

    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 500000,
  },
  networks: {
    "hardhat": {
      chainId: 31337,
    },
    "localhost": {
      chainId: 1337,
      url: LOCALHOST_RPC_URL,
      accounts: [LOCALHOST_PRIVATE_KEY, LOCALHOST_PRIVATE_KEY_TWO, LOCALHOST_PRIVATE_KEY_THREE],
    },
    "sepolia": {
      chainId: 11155111,
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 6,
      gasPrice: 100000000000,
      gasMultiplier: 1.5,
      timeout: 2000000
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
    outputFile: 'gas-report.txt',
    enabled: true,
  }
};