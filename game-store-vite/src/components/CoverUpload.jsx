import { useState, useRef } from 'react';
import { uploadFile, deleteFile } from '../utils/apiUtils';

/**
 * CoverUpload Component
 * 
 * A reusable component for uploading cover images to S3 using presigned URLs.
 *  
 * @param {string} currentCover - Current cover filename (without path)
 * @param {function} onCoverChange - Callback function called when cover changes (receives filename)
 * @param {string} prefix - S3 prefix/folder path (default: 'categories')
 * @param {boolean} disabled - Whether the upload is disabled
 * @param {string} className - Additional CSS classes
 * 
 * Usage examples:
 * - Categories: <CoverUpload prefix="categories/covers" ... />
 * - Games: <CoverUpload prefix="games/covers" ... />
 * - Users: <CoverUpload prefix="users/avatars" ... />
 */

const CoverUpload = ({ 
  currentCover, 
  onCoverChange, 
  prefix = 'categories',
  disabled = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setError('');

      console.log(`[CoverUpload] Starting upload for file: ${file.name} (${file.size} bytes) to prefix: ${prefix}`);
      
      const result = await uploadFile(file, prefix);
      
      console.log('[CoverUpload] Upload result:', result);
      
      if (result.success) {
        // Extract filename from the file URL for storage
        const fileName = result.fileName;
        console.log(`[CoverUpload] Upload successful, filename: ${fileName}`);
        onCoverChange(fileName);
        setPreview(null); // Clear preview since we have the uploaded file
      } else {
        throw new Error('Upload was not successful');
      }
    } catch (error) {
      console.error('[CoverUpload] Upload error:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        errorMessage = 'Upload timed out after 60 seconds. Please check your internet connection and try again, or use a smaller file.';
      } else if (error.message.includes('Network') || error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('Access denied')) {
        errorMessage = 'Access denied during upload. This may be due to server configuration issues. Please try again in a few minutes.';
      } else if (error.message.includes('400') || error.message.includes('Bad request')) {
        errorMessage = 'Invalid file format or corrupted file. Please try with a different image.';
      } else if (error.message.includes('413') || error.message.includes('too large')) {
        errorMessage = 'File is too large. Please select a smaller file (max 10MB recommended).';
      } else if (error.message.includes('415') || error.message.includes('media type')) {
        errorMessage = 'Unsupported file type. Please select a valid image file.';
      } else if (error.message.includes('500') || error.message.includes('Server error')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCover) return;

    try {
      setDeleting(true);
      setError('');

      // Construct the full file path for deletion
      const fullFilePath = `${prefix}/${currentCover}`;
      
      // Call the delete API
      await deleteFile(fullFilePath);
      
      // Only clear the state after successful deletion
      onCoverChange('');
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete cover image. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplace = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getImageUrl = (cover) => {
    if (!cover) return null;
    return `https://s3.tebi.io/game-key-store/${prefix}/${cover}`;
  };

  const currentImageUrl = getImageUrl(currentCover);
  const displayImage = preview || currentImageUrl;

  // Check if any operation is in progress
  const isProcessing = uploading || deleting;

  // Debug logging
  console.log('CoverUpload rendering:', { currentCover, disabled, uploading, deleting });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button - Always Visible */}
      {!disabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Cover
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                {uploading ? 'Uploading...' : 'Deleting...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {currentCover ? 'Change Cover Image' : 'Upload Cover Image'}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Current Cover Display */}
      <div className="relative">        
        {displayImage ? (
          <div className="relative inline-block">
            <img
              src={displayImage}
              alt="Category cover"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
            
            {/* Upload Progress Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-xs">{uploading ? 'Uploading...' : 'Deleting...'}</p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {!isProcessing && !disabled && (
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  type="button"
                  onClick={handleReplace}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                  title="Replace cover"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                  title="Delete cover"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {isProcessing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Deleting...'}</p>
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500 mt-1">No cover</p>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>Supported formats: JPG, PNG, GIF</p>
        <p>Max file size: 5MB</p>
        <p>Recommended size: 400x400px</p>
      </div>
    </div>
  );
};

export default CoverUpload;
