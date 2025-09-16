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

  // Ensure frontend constants directories exist
  const backendConstantsDir = path.join(__dirname, "../frontend/constants");
  const frontendConstantsDir = path.join(__dirname, "../../frontend/src/constants");

  if (!fs.existsSync(backendConstantsDir)) {
    fs.mkdirSync(backendConstantsDir, { recursive: true });
  }
  if (!fs.existsSync(frontendConstantsDir)) {
    fs.mkdirSync(frontendConstantsDir, { recursive: true });
  }

  // Save deployment info to backend constants directory
  const deploymentPath = path.join(backendConstantsDir, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Backend deployment info saved to: ${deploymentPath}`);

  // Also save ABI separately for backend integration
  const abiPath = path.join(backendConstantsDir, "abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log(`Backend ABI saved to: ${abiPath}`);

  // Save contract address separately for backend
  const addressPath = path.join(backendConstantsDir, "contractAddress.json");
  fs.writeFileSync(addressPath, JSON.stringify({ address: contractAddress }, null, 2));
  console.log(`Backend contract address saved to: ${addressPath}`);

  // Save deployment info to frontend constants directory
  const frontendDeploymentPath = path.join(frontendConstantsDir, "deployment.json");
  fs.writeFileSync(frontendDeploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Frontend deployment info saved to: ${frontendDeploymentPath}`);

  // Create frontend environment config
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");
  const envContent = `# Auto-generated deployment configuration
VITE_CONTRACT_ADDRESS=${contractAddress}
VITE_CHAIN_ID=${deploymentInfo.chainId}
VITE_NETWORK_NAME=${deploymentInfo.network}
VITE_DEPLOYED_AT=${deploymentInfo.deployedAt}

# Add your RPC URLs and API keys
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
VITE_LOCALHOST_RPC_URL=http://localhost:8545

# IPFS Configuration (Optional)
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_PINATA_API_KEY=
VITE_PINATA_SECRET_KEY=

# Development
VITE_DEBUG=true
`;

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log(`Frontend environment config saved to: ${frontendEnvPath}`);

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
