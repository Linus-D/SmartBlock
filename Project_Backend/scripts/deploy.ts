import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment of SocialMediaPlatform...");

  // Get the contract factory
  const SocialMediaPlatform = await ethers.getContractFactory("SocialMediaPlatform");

  // Deploy the contract
  console.log("Deploying SocialMediaPlatform...");
  const socialMedia = await SocialMediaPlatform.deploy();
  await socialMedia.waitForDeployment();

  const contractAddress = await socialMedia.getAddress();
  console.log(`SocialMediaPlatform deployed to: ${contractAddress}`);

  // Get the contract ABI from artifacts
  const artifact = await hre.artifacts.readArtifact("SocialMediaPlatform");
  const abi = artifact.abi;

  // Create deployment info object
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress,
    abi: abi,
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  // Ensure frontend/constants directory exists
  const constantsDir = path.join(__dirname, "../frontend/constants");
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentPath = path.join(constantsDir, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);

  // Also save ABI separately for easier frontend integration
  const abiPath = path.join(constantsDir, "abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log(`ABI saved to: ${abiPath}`);

  // Save contract address separately
  const addressPath = path.join(constantsDir, "contractAddress.json");
  fs.writeFileSync(addressPath, JSON.stringify({ address: contractAddress }, null, 2));
  console.log(`Contract address saved to: ${addressPath}`);

  console.log("\n=== Deployment Summary ===");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Deployed At: ${deploymentInfo.deployedAt}`);
  console.log("\n=== Next Steps ===");
  console.log("1. Update your .env file with the correct network details");
  console.log("2. Verify the contract on Etherscan (if on testnet/mainnet)");
  console.log("3. Use the generated files in frontend/constants/ for your frontend integration");

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
