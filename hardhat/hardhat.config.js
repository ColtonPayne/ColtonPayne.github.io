require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');

// Colton's Keys
// Metamask Private Key Only has test ETH in it- is fine to be here lol
const ALCHEMY_API_KEY = "i8TvfitQzT1YuaycST8Fi1O3WSvrIRpF";
const GOERLI_PRIVATE_KEY = "d346f4252d934dad2f02b02157642f4eafc2e88679dce9dc6baddc8a786e3103";
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