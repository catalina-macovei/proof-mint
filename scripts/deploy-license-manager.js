const hre = require("hardhat");

async function main() {
  console.log("Deploying LicenseManager...");
  
  const LicenseManager = await hre.ethers.getContractFactory("LicenseManager");
  const licenseManager = await LicenseManager.deploy();
  await licenseManager.waitForDeployment();

  const address = await licenseManager.getAddress();
  console.log(`LicenseManager deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
