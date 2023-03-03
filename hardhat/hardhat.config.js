require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');

// Colton's Keys
// Metamask Private Key Only has test ETH in it- is fine to be here lol
const ALCHEMY_API_KEY = "0dnZ__xSlUHtnYIyo2yc6vialYMDU52y";
const GOERLI_PRIVATE_KEY = "c5b637544676a9b2fd0beab1320ace153cb6bf4796764d1026af4bcdbdc6d6f1";
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