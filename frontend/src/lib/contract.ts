import { ethers } from "ethers";
import type { SocialMediaPlatform } from "../../../Project_Backend/typechain-types";
import contractABI from "../../../Project_Backend/frontend/constants/abi.json";
import contractAddress from "../../../Project_Backend/frontend/constants/contractAddress.json";

export const CONTRACT_ADDRESS = contractAddress.address;
export const CONTRACT_ABI = contractABI;

export const getContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
): SocialMediaPlatform => {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signerOrProvider
  ) as unknown as SocialMediaPlatform;
};
