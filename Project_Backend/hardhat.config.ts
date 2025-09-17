// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// ---------- Environment variable checks ----------
function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(
      `❌ Missing required environment variable: ${name}.
Please create a .env file in Project_Backend/ with this variable.`
    );
  }
  return v;
}

// Chain / Local defaults
const CHAIN_ID = parseInt(process.env.VITE_CHAIN_ID || "31337", 10);
const LOCAL_RPC_URL = process.env.VITE_RPC_URL || "http://127.0.0.1:8545";

// Sepolia – will throw if not present
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
  ? process.env.SEPOLIA_RPC_URL
  : (() => {
      throw new Error(
        "❌ SEPOLIA_RPC_URL is missing. Add it to .env, e.g.:\n" +
          "SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/q_kkRez73ri5phr4duHN0"
      );
    })();

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY
  ? process.env.SEPOLIA_PRIVATE_KEY
  : (() => {
      throw new Error(
        "❌ SEPOLIA_PRIVATE_KEY is missing. Add it to .env (with 0x prefix)."
      );
    })();

// Optional Etherscan key (only needed for verification)
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// ---------- Hardhat config ----------
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    hardhat: { chainId: CHAIN_ID },
    localhost: { url: LOCAL_RPC_URL, chainId: CHAIN_ID },
    sepolia: {
      url: SEPOLIA_RPC_URL, // will never be undefined now
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
    },
  },

  etherscan: { apiKey: ETHERSCAN_API_KEY },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
