const { ethers } = require("hardhat");

async function main() {
  // Replace with the actual implementation contract of IEAS
  const EASImplementation = await ethers.getContractFactory("EASImplementation"); // Change to actual implementation contract
  console.log("Deploying EAS implementation contract...");
  const eas = await EASImplementation.deploy();
  await eas.deployed();
  console.log("EAS implementation deployed to:", eas.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
