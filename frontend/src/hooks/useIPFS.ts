// src/hooks/useIPFS.ts
import { useState } from "react";
import { uploadToIPFS, uploadJSONToIPFS, getIPFSUrl } from "../lib/ipfs";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useIPFS = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size exceeds 50MB limit");
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Upload to IPFS
      const hash = await uploadToIPFS(file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("File uploaded to IPFS successfully:", hash);
      return hash;
    } catch (error: any) {
      console.error("Error uploading file to IPFS:", error);
      setError(error.message || "Failed to upload file to IPFS");
      throw error;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const uploadJSON = async (data: object): Promise<string> => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data provided");
    }

    setIsUploading(true);
    setError(null);

    try {
      setUploadProgress(50); // Simulate progress
      const hash = await uploadJSONToIPFS(data);
      setUploadProgress(100);

      console.log("JSON uploaded to IPFS successfully:", hash);
      return hash;
    } catch (error: any) {
      console.error("Error uploading JSON to IPFS:", error);
      setError(error.message || "Failed to upload JSON to IPFS");
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const hashes: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update progress
        const baseProgress = (i / totalFiles) * 100;
        setUploadProgress(baseProgress);

        try {
          const hash = await uploadToIPFS(file);
          hashes.push(hash);

          // Update progress for completed file
          setUploadProgress(((i + 1) / totalFiles) * 100);
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          // Continue with other files, but log the error
        }
      }

      console.log("Multiple files uploaded successfully:", hashes);
      return hashes;
    } catch (error: any) {
      console.error("Error uploading multiple files:", error);
      setError(error.message || "Failed to upload files");
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const getFileUrl = (hash: string, gateway?: string): string => {
    if (!hash) return "";

    const customGateway = gateway || import.meta.env.VITE_IPFS_GATEWAY;

    if (customGateway) {
      return `${customGateway}${hash}`;
    }

    return getIPFSUrl(hash);
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File size exceeds 50MB limit",
      };
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported`,
      };
    }

    return { isValid: true };
  };

  const getFileType = (
    file: File
  ): "image" | "video" | "audio" | "document" | "other" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf" || file.type === "text/plain")
      return "document";
    return "other";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clearError = () => {
    setError(null);
  };

  // Return all functions and state
  return {
    // Upload functions
    uploadFile,
    uploadJSON,
    uploadMultipleFiles,

    // Utility functions
    getFileUrl,
    validateFile,
    getFileType,
    formatFileSize,
    clearError,

    // State
    isUploading,
    uploadProgress,
    error,
  };
};
