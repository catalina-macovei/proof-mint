const hre = require("hardhat");

async function main() {
  console.log("Deploying PublicLicense contract...");

  const PublicLicense = await hre.ethers.getContractFactory("PublicLicense");
  const publicLicense = await PublicLicense.deploy();

  await publicLicense.waitForDeployment();

  const address = await publicLicense.getAddress();

  console.log(`PublicLicense deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
