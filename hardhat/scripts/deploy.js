async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("Token");

  
    console.log("Deploying Token")
    const token = await Token.deploy();
    console.log("Ran");
  
    console.log("Token address:", token.address);

    //await new Promise(r => setTimeout(r, 180000));
    //console.log("Wake");

    //await token.initialize("0x6871fe00ad6ea23439b5d62f09461fcc1c959355")
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

