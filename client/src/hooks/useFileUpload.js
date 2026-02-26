import { useState, useCallback } from 'react';

/**
 * Custom hook to handle file uploads with preview
 * 
 * @param {Object} options - Upload options
 * @param {Array<string>} options.acceptedTypes - Accepted file types (e.g., ['image/*', 'application/pdf'])
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 5)
 * @param {Function} options.onUpload - Async function to handle upload
 * @returns {Object} File upload state and handlers
 * 
 * @example
 * const { file, preview, handleFileChange, uploadFile, clearFile, uploading, error } = 
 *   useFileUpload({ maxSizeMB: 10, acceptedTypes: ['image/*'] });
 * 
 * return (
 *   <>
 *     <input type="file" onChange={handleFileChange} />
 *     {preview && <img src={preview} alt="Preview" />}
 *     <button onClick={uploadFile} disabled={uploading}>Upload</button>
 *   </>
 * );
 */
export const useFileUpload = (options = {}) => {
  const { 
    acceptedTypes = [], 
    maxSizeMB = 5,
    onUpload
  } = options;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file type
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return selectedFile.type.startsWith(type.replace('/*', ''));
        }
        return selectedFile.type === type;
      });

      if (!isAccepted) {
        setError(`File type not accepted. Accepted types: ${acceptedTypes.join(', ')}`);
        return;
      }
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, [acceptedTypes, maxSizeMB]);

  const uploadFile = useCallback(async () => {
    if (!file || !onUpload) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      await onUpload(file, setProgress);
      
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [file, onUpload]);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    file,
    preview,
    handleFileChange,
    uploadFile,
    clearFile,
    uploading,
    error,
    progress
  };
};
