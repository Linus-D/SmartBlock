// src/lib/contractService.ts
import { ethers } from "ethers";
import { CONTRACT_CONFIG } from "./contractConfig";
import type { UserProfile } from "../types/contract";

export class SocialMediaContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!CONTRACT_CONFIG.address) {
      throw new Error(
        "Contract address not configured. Please set VITE_CONTRACT_ADDRESS environment variable."
      );
    }

    if (!ethers.isAddress(CONTRACT_CONFIG.address)) {
      throw new Error(`Invalid contract address: ${CONTRACT_CONFIG.address}`);
    }
  }

  // Initialize with provider (read-only)
  public initializeWithProvider(provider: ethers.Provider): void {
    this.provider = provider;
    this.signer = null;
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      provider
    );
  }

  // Initialize with signer (read-write)
  public initializeWithSigner(signer: ethers.Signer): void {
    this.signer = signer;
    this.provider = signer.provider || this.provider; // Use provider from signer or fallback
    if (!this.provider) {
      throw new Error("Signer does not have a provider attached.");
    }
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      signer
    );
  }

  private ensureContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error(
        "Contract not initialized. Call initializeWithProvider or initializeWithSigner first."
      );
    }
    return this.contract;
  }

  private ensureSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error(
        "Signer not available. This operation requires a wallet connection."
      );
    }
    return this.signer;
  }

  // --- User Management Functions ---

  public async getUserProfile(address: string): Promise<UserProfile | null> {
    const contract = this.ensureContract();
    // Call "users" mapping getter
    const userInfo = await contract.users(address);

    // Expect userInfo to have a boolean isRegistered or similar flag
    if (userInfo.isRegistered) {
      return {
        username: userInfo.username,
        bio: '', // Default empty bio
        profileImageHash: userInfo.profilePictureHash,
        profilePictureHash: userInfo.profilePictureHash, // Legacy compatibility
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
        isActive: true,
        isRegistered: userInfo.isRegistered,
        registrationDate: Number(userInfo.registrationDate),
      };
    } else {
      return null;
    }
  }

  public async createProfile(
    username: string,
    bio: string = "",
    profileImageHash: string = ""
  ): Promise<void> {
    const contract = this.ensureContract();
    this.ensureSigner();

    if (contract.createProfile) {
      const tx = await contract.createProfile(username, bio, profileImageHash);
      await tx.wait();
    } else if (contract.registerUser) {
      const tx = await contract.registerUser(username);
      await tx.wait();
    } else {
      throw new Error(
        "No user registration function found on the contract ('createProfile' or 'registerUser')."
      );
    }
  }

  // Add updateProfile if required (optional)
}

// Singleton instance
export const contractService = new SocialMediaContractService();
