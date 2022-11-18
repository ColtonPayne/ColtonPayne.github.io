require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');

// Colton's Keys
// Metamask Private Key Only has test ETH in it- is fine to be here lol
const ALCHEMY_API_KEY = "i8TvfitQzT1YuaycST8Fi1O3WSvrIRpF";
const GOERLI_PRIVATE_KEY = "abe509bb656d687cd4cb372a5912de460e528b82480bf24e130ffb259e8f9c99";
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