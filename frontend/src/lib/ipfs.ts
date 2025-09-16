// frontend/src/lib/ipfs.ts
import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface IPFSUploadOptions {
  name?: string;
  description?: string;
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

  async uploadFile(file: File, options?: IPFSUploadOptions): Promise<string> {
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
      const response = await axios.post<PinataResponse>(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error("IPFS upload failed:", error);
      throw new Error("Failed to upload file to IPFS");
    }
  }

  async uploadJSON(data: object, options?: IPFSUploadOptions): Promise<string> {
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
      const response = await axios.post<PinataResponse>(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
        }
      );

      return response.data.IpfsHash;
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
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch IPFS JSON:", error);
      throw new Error("Failed to fetch data from IPFS");
    }
  }
}

// frontend/src/hooks/useIPFS.ts
import { useState } from "react";
import { IPFSService } from "../lib/ipfs";

interface UseIPFSReturn {
  uploadFile: (
    file: File,
    options?: { name?: string; description?: string }
  ) => Promise<string>;
  uploadJSON: (
    data: object,
    options?: { name?: string; description?: string }
  ) => Promise<string>;
  getFileUrl: (hash: string) => string;
  fetchJSON: <T>(hash: string) => Promise<T>;
  uploading: boolean;
  error: string | null;
}

export const useIPFS = (): UseIPFSReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ipfsService = IPFSService.getInstance();

  const uploadFile = async (
    file: File,
    options?: { name?: string; description?: string }
  ): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const hash = await ipfsService.uploadFile(file, options);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadJSON = async (
    data: object,
    options?: { name?: string; description?: string }
  ): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const hash = await ipfsService.uploadJSON(data, options);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = (hash: string): string => {
    return ipfsService.getFileUrl(hash);
  };

  const fetchJSON = async <T>(hash: string): Promise<T> => {
    setError(null);
    try {
      return await ipfsService.fetchJSON<T>(hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Fetch failed";
      setError(errorMessage);
      throw err;
    }
  };

  return {
    uploadFile,
    uploadJSON,
    getFileUrl,
    fetchJSON,
    uploading,
    error,
  };
};

// frontend/src/utils/imageUtils.ts
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image."
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      "File size too large. Please upload an image smaller than 10MB."
    );
  }

  return true;
};
