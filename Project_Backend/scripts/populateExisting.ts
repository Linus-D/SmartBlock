// scripts/populateExisting.ts
import { ethers } from "hardhat";
import { SocialMediaPlatform } from "../typechain-types";

async function main() {
  console.log("🚀 Populating existing contract with sample data...");

  // Get the deployed contract
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("VITE_CONTRACT_ADDRESS not set in environment");
  }

  const contract = await ethers.getContractAt("SocialMediaPlatform", contractAddress);
  const [deployer, user1, user2] = await ethers.getSigners();

  try {
    // Register users
    console.log("📝 Registering users...");
    await contract.connect(user1).registerUser("alice");
    await contract.connect(user2).registerUser("bob");

    // Create posts
    console.log("📄 Creating posts...");
    await contract.connect(user1).createPost("Hello SmartBlock! This is my first post.", "");
    await contract.connect(user2).createPost("Welcome to decentralized social media!", "");

    console.log("✅ Sample data populated successfully!");
  } catch (error) {
    console.error("❌ Error populating data:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });