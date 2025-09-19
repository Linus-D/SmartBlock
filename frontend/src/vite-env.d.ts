// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_SEPOLIA_RPC_URL: string;
  readonly VITE_LOCALHOST_RPC_URL: string;
  readonly VITE_PINATA_API_KEY: string;
  readonly VITE_PINATA_SECRET_KEY: string;
  readonly VITE_IPFS_GATEWAY: string;
  readonly VITE_IPFS_PROJECT_ID: string;
  readonly VITE_IPFS_PROJECT_SECRET: string;
  readonly VITE_DATA_MODE: string;
  readonly VITE_SERVER_URL: string;
  readonly VITE_AI_ENGINE_URL: string;
  readonly VITE_DEBUG: string;
  
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}