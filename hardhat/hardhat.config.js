require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');

const ALCHEMY_API_KEY = "ALCHEMY_API_KEY";
const GOERLI_PRIVATE_KEY = "PRIVATE_KEY"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
      gas: 10000000
    }
  }
};