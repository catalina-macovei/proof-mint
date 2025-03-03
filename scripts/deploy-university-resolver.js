const { ethers } = require("hardhat");

async function main() {
  // Retrieve the contract factory for LicenseResolver
  const Resolver = await ethers.getContractFactory("LicenseResolver");

  // Use the pre-deployed EAS address on Sepolia
  const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
  
  // Define your owner address
  const ownerAddress = "0xb4Baa0098fE8fF203C2A419a8Bd24173E5f94Eb1";

  console.log("Deploying LicenseResolver with EAS address:", EAS_ADDRESS, "and owner:", ownerAddress);
  const resolver = await Resolver.deploy(EAS_ADDRESS, ownerAddress);

  // Wait until the contract is fully deployed using waitForDeployment()
  await resolver.waitForDeployment();

  // Retrieve and print the deployed contract address
  const deployedAddress = await resolver.getAddress();
  console.log("LicenseResolver deployed to:", deployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // address : 0xCD25afc749Bb79dB0F61dEAA210bc7f15c99Ba98