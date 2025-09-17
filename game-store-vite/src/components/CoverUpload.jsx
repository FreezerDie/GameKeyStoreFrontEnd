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
 * @param {string} label - Custom label for the upload section (auto-generated based on prefix if not provided)
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
  className = '',
  label = null
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Generate dynamic label based on prefix
  const getUploadLabel = () => {
    if (label) return label;
    
    if (prefix.includes('games')) return 'Game Cover';
    if (prefix.includes('categories')) return 'Category Cover';
    if (prefix.includes('users') || prefix.includes('avatars')) return 'Profile Picture';
    
    return 'Cover Image';
  };

  const uploadLabel = getUploadLabel();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    // ✅ CRITICAL DEBUG: Log the complete file selection process
    console.log(`[CoverUpload] 📁 File selection triggered`);
    console.log(`[CoverUpload] 🔍 FILES DEBUG - Input files list:`, event.target.files);
    console.log(`[CoverUpload] 🔍 FILES DEBUG - Files list length:`, event.target.files.length);
    
    if (!file) {
      console.log(`[CoverUpload] ❌ No file selected`);
      return;
    }

    // ✅ CRITICAL DEBUG: Validate and log file object immediately after selection
    console.log(`[CoverUpload] 📄 SELECTED FILE DEBUG:`, {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      constructor: file.constructor.name,
      isFile: file instanceof File,
      isBlob: file instanceof Blob,
      webkitRelativePath: file.webkitRelativePath
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error(`[CoverUpload] ❌ Invalid file type: ${file.type}`);
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error(`[CoverUpload] ❌ File too large: ${file.size} bytes (max 5MB)`);
      setError('File size must be less than 5MB');
      return;
    }

    console.log(`[CoverUpload] ✅ File validation passed, proceeding with upload...`);
    setError('');
    setPreview(URL.createObjectURL(file));
    
    // ✅ CRITICAL DEBUG: Log file object right before passing to upload
    console.log(`[CoverUpload] 🚀 About to call handleUpload with file:`, {
      name: file.name,
      size: file.size,
      type: file.type,
      isStillFile: file instanceof File,
      isStillBlob: file instanceof Blob
    });
    
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    // ✅ CRITICAL DEBUG: Validate file object at start of upload function
    console.log(`[CoverUpload] 🎯 handleUpload called with file:`, {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      isFile: file instanceof File,
      isBlob: file instanceof Blob,
      constructor: file?.constructor?.name
    });
    
    if (!file) {
      console.error(`[CoverUpload] ❌ handleUpload called with null/undefined file!`);
      setError('No file provided to upload function');
      return;
    }
    
    if (!(file instanceof File) && !(file instanceof Blob)) {
      console.error(`[CoverUpload] ❌ handleUpload called with invalid file object:`, typeof file, file);
      setError('Invalid file object provided to upload function');
      return;
    }
    
    try {
      setUploading(true);
      setError('');

      console.log(`[CoverUpload] Starting upload for file: ${file.name} (${file.size} bytes) to prefix: ${prefix}`);
      
      // ✅ CRITICAL DEBUG: Log file object right before calling uploadFile
      console.log(`[CoverUpload] 📤 About to call uploadFile with:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        prefix: prefix,
        isStillFile: file instanceof File,
        isStillBlob: file instanceof Blob
      });
      
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
      } else if (error.message.includes('InvalidAccessKeyId') || error.message.includes('Access Key Id')) {
        errorMessage = '🔧 Server Configuration Issue: S3 storage is not properly configured. Please contact your administrator to set up valid AWS S3 credentials.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('Access denied')) {
        errorMessage = 'Access denied during upload. This may be due to server configuration issues or expired upload permissions. Please try again in a few minutes.';
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
            {uploadLabel}
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
              alt={uploadLabel}
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
        <div className={`text-sm rounded-lg p-3 ${
          error.includes('Server Configuration Issue') 
            ? 'text-orange-800 bg-orange-50 border border-orange-200' 
            : 'text-red-600 bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {error.includes('Server Configuration Issue') ? (
                <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-2 flex-1">
              {error}
              {error.includes('Server Configuration Issue') && (
                <div className="mt-2 text-xs text-orange-600">
                  <strong>For developers:</strong> Check your backend S3 configuration including AWS access keys, secret keys, and bucket permissions.
                </div>
              )}
            </div>
          </div>
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
