import { useState, useCallback } from 'react';
import { ipfsService, type IPFSUploadOptions, type IPFSFile } from '../lib/ipfs';

interface UploadProgress {
  file: string;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UseIPFSReturn {
  // Upload functions
  uploadFile: (file: File, options?: IPFSUploadOptions) => Promise<IPFSFile>;
  uploadJSON: (data: any, options?: IPFSUploadOptions) => Promise<IPFSFile>;
  uploadAvatar: (file: File) => Promise<IPFSFile>;
  
  // Retrieval functions
  getFileUrl: (hash: string) => string;
  fetchJSON: <T = any>(hash: string) => Promise<T>;

  // State
  isUploading: boolean;
  uploadProgress: UploadProgress[];
  error: string | null;

  // Utility
  clearProgress: (fileName?: string) => void;
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
    options?: IPFSUploadOptions
  ): Promise<IPFSFile> => {
    setIsUploading(true);
    setError(null);
    updateProgress(file.name, { status: 'uploading', progress: 0 });

    try {
      const result = await ipfsService.uploadFile(file, options);
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
    options?: IPFSUploadOptions
  ): Promise<IPFSFile> => {
    setIsUploading(true);
    setError(null);
    const fileName = options?.name || 'JSON Data';
    updateProgress(fileName, { status: 'uploading', progress: 50 });

    try {
      const result = await ipfsService.uploadJSON(data, options);
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
      name: `Avatar-${Date.now()}`,
      description: 'User avatar image'
    });
  }, [uploadFile]);

  const getFileUrl = useCallback((hash: string): string => {
    return ipfsService.getFileUrl(hash);
  }, []);

  const fetchJSON = useCallback(async <T = any>(hash: string): Promise<T> => {
    setError(null);
    try {
      return await ipfsService.fetchJSON<T>(hash);
    } catch (err: any) {
      const errorMsg = err.message || 'Fetch failed';
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    uploadFile,
    uploadJSON,
    uploadAvatar,
    getFileUrl,
    fetchJSON,
    isUploading,
    uploadProgress,
    error,
    clearProgress
  };
};