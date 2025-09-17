import { useState, useCallback } from 'react';
import { ipfsService, IPFSFile } from '../lib/ipfs';

interface UploadProgress {
  file: string;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UseIPFSReturn {
  // Upload functions
  uploadFile: (file: File, metadata?: Record<string, any>) => Promise<IPFSFile>;
  uploadJSON: (data: any, name?: string) => Promise<IPFSFile>;
  uploadAvatar: (file: File) => Promise<IPFSFile>;
  uploadPostMedia: (files: File[]) => Promise<IPFSFile[]>;
  uploadPostMetadata: (content: any) => Promise<IPFSFile>;
  uploadProfileMetadata: (profile: any) => Promise<IPFSFile>;

  // Retrieval functions
  getData: <T = any>(hash: string) => Promise<T>;
  getFileUrl: (hash: string) => string;

  // State
  isUploading: boolean;
  uploadProgress: UploadProgress[];
  error: string | null;

  // Configuration
  isConfigured: boolean;
  testConnection: () => Promise<boolean>;
}

export const useIPFS = (): UseIPFSReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback((fileName: string, progress: Partial<UploadProgress>) => {
    setUploadProgress(prev => {
      const existingIndex = prev.findIndex(p => p.file === fileName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...progress };
        return updated;
      } else {
        return [...prev, { file: fileName, progress: 0, status: 'idle', ...progress }];
      }
    });
  }, []);

  const clearProgress = useCallback((fileName?: string) => {
    if (fileName) {
      setUploadProgress(prev => prev.filter(p => p.file !== fileName));
    } else {
      setUploadProgress([]);
    }
  }, []);

  const uploadFile = useCallback(async (
    file: File, 
    metadata?: Record<string, any>
  ): Promise<IPFSFile> => {
    setIsUploading(true);
    setError(null);
    updateProgress(file.name, { status: 'uploading', progress: 0 });

    try {
      const result = await ipfsService.uploadFile(file, metadata);
      updateProgress(file.name, { status: 'completed', progress: 100 });
      
      // Clear progress after a short delay
      setTimeout(() => clearProgress(file.name), 2000);
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      updateProgress(file.name, { status: 'error', error: errorMsg });
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [updateProgress, clearProgress]);

  const uploadJSON = useCallback(async (
    data: any, 
    name?: string
  ): Promise<IPFSFile> => {
    setIsUploading(true);
    setError(null);
    const fileName = name || 'JSON Data';
    updateProgress(fileName, { status: 'uploading', progress: 50 });

    try {
      const result = await ipfsService.uploadJSON(data, name);
      updateProgress(fileName, { status: 'completed', progress: 100 });
      
      setTimeout(() => clearProgress(fileName), 2000);
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'JSON upload failed';
      setError(errorMsg);
      updateProgress(fileName, { status: 'error', error: errorMsg });
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [updateProgress, clearProgress]);

  const uploadAvatar = useCallback(async (file: File): Promise<IPFSFile> => {
    return uploadFile(file, {
      category: 'avatar',
      type: 'profile-image',
      name: `Avatar-${Date.now()}`,
    });
  }, [uploadFile]);

  return {
    uploadToIPFS,
    uploadFile,
    uploadAvatar,
    uploadProgress,
    isUploading,
    clearProgress
  };
};