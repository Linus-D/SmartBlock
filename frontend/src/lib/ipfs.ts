// frontend/src/lib/ipfs.ts
// import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

// interface PinataResponse {
//   IpfsHash: string;
//   PinSize: number;
//   Timestamp: string;
// }

interface IPFSUploadOptions {
  name?: string;
  description?: string;
}

export interface IPFSFile {
  hash: string;
  name: string;
  size?: number;
  url: string;
}

export class IPFSService {
  private static instance: IPFSService;
  private apiKey: string;
  private secretKey: string;

  private constructor() {
    this.apiKey = PINATA_API_KEY;
    this.secretKey = PINATA_SECRET_KEY;

    if (!this.apiKey || !this.secretKey) {
      console.warn("Pinata API keys not configured");
    }
  }

  static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  async uploadFile(file: File, options?: IPFSUploadOptions): Promise<IPFSFile> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error("Pinata API keys not configured");
    }

    const formData = new FormData();
    formData.append("file", file);

    if (options) {
      const metadata = JSON.stringify({
        name: options.name || file.name,
        keyvalues: {
          description: options.description || "",
          uploadedAt: new Date().toISOString(),
        },
      });
      formData.append("pinataMetadata", metadata);
    }

    try {
      // Mock implementation for now - replace with actual axios when available
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretKey,
        },
        body: formData,
      }).then(res => res.json());

      const hash = response.IpfsHash;
      return {
        hash,
        name: options?.name || file.name,
        size: file.size,
        url: this.getFileUrl(hash)
      };
    } catch (error) {
      console.error("IPFS upload failed:", error);
      throw new Error("Failed to upload file to IPFS");
    }
  }

  async uploadJSON(data: object, options?: IPFSUploadOptions): Promise<IPFSFile> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error("Pinata API keys not configured");
    }

    const body = {
      pinataContent: data,
      pinataMetadata: {
        name: options?.name || "JSON Data",
        keyvalues: {
          description: options?.description || "",
          uploadedAt: new Date().toISOString(),
        },
      },
    };

    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretKey,
        },
        body: JSON.stringify(body),
      }).then(res => res.json());

      const hash = response.IpfsHash;
      return {
        hash,
        name: options?.name || "JSON Data",
        url: this.getFileUrl(hash)
      };
    } catch (error) {
      console.error("IPFS JSON upload failed:", error);
      throw new Error("Failed to upload JSON to IPFS");
    }
  }

  getFileUrl(hash: string): string {
    return `${IPFS_GATEWAY}${hash}`;
  }

  async fetchJSON<T>(hash: string): Promise<T> {
    try {
      const url = this.getFileUrl(hash);
      const response = await fetch(url).then(res => res.json());
      return response;
    } catch (error) {
      console.error("Failed to fetch IPFS JSON:", error);
      throw new Error("Failed to fetch data from IPFS");
    }
  }
}

// Create singleton instance for export
export const ipfsService = IPFSService.getInstance();

// Export types
export type { IPFSUploadOptions };
