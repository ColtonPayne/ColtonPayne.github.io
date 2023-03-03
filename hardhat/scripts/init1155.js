async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const PropelToken = await ethers.getContractFactory("Propel1155Token");

  
    const token = await PropelToken.attach('0x14089D33d08D738A7546495f918592fEd49b9098');
 
    await token.initialize()
    console.log("Init done")

    await token.setCore('0x43540dE1763be5Fb5A6743292631d4f6046751a9');
    console.log("Core set")



}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });