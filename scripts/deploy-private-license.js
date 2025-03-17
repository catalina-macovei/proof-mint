const hre = require("hardhat");

async function main() {
  console.log("Deploying Private License contract...");

  const PrivateLicense = await hre.ethers.getContractFactory("PrivateLicense");
  const privateLicense = await PrivateLicense.deploy();

  await privateLicense.waitForDeployment();

  const address = await privateLicense.getAddress();

  console.log(`PrivateLicense deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
