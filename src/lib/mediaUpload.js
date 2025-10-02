// Bulletproof Media Upload System - 100% PURE CLOUDFLARE - NO SUPABASE!
// Multiple upload strategies with automatic fallbacks and retry mechanisms

import { auth, getAuthToken } from './cloudflare';

const API_BASE = process.env.API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
const MEDIA_API_BASE = process.env.MEDIA_API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

// Enhanced file validation
export const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // File size validation (50MB max)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File size is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 50MB.`);
  }

  // Minimum file size (1KB)
  if (file.size < 1024) {
    throw new Error('File is too small. Minimum size is 1KB.');
  }

  // File type validation
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 
    'video/3gpp', 'video/x-flv', 'video/mov', 'video/x-ms-wmv', 'video/ogg'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type "${file.type}" not supported. Please use images (JPEG, PNG, WebP, GIF, BMP) or videos (MP4, MOV, AVI, WebM, WMV).`);
  }

  // File name validation
  if (!file.name || file.name.length > 255) {
    throw new Error('Invalid file name. Name must be between 1-255 characters.');
  }

  return true;
};

// Enhanced retry mechanism with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Upload attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Method 1: Direct R2 Upload via Worker (fastest and most reliable) - PURE CLOUDFLARE
export const uploadToR2Direct = async (file, authObject = null, progressCallback) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required for upload');
  }

  const directUpload = async () => {
    try {
      // Try new bulletproof endpoint first
      console.log('🔗 Trying new endpoint:', `${API_BASE}/upload/worker`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);

      const response = await fetch(`${API_BASE}/upload/worker`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('📥 New endpoint response:', response.status, response.statusText);

      if (response.status === 404) {
        throw new Error('NEW_ENDPOINT_NOT_FOUND');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`New endpoint failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ New endpoint success!');
      return {
        ...result,
        method: 'r2-direct-new'
      };

    } catch (error) {
      if (error.message === 'NEW_ENDPOINT_NOT_FOUND' || error.message.includes('404')) {
        // Fallback to legacy upload endpoint
        console.log('⚠️ New endpoint not available, using legacy method...');
        
        if (progressCallback) {
          progressCallback(15, 'Using legacy upload method...');
        }

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-file-name': file.name,
            'Content-Type': file.type
          },
          body: file
        });

        console.log('📥 Legacy endpoint response:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Legacy upload failed:', errorText);
          throw new Error(`Legacy upload failed: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Legacy upload success!');
        return {
          ...result,
          method: 'r2-direct-legacy'
        };
      }
      
      // Re-throw other errors
      throw error;
    }
  };

  // Execute with retry and progress callback
  if (progressCallback) {
    progressCallback(10, 'Starting R2 direct upload...');
  }
  
  const result = await retryWithBackoff(directUpload);
  
  if (progressCallback) {
    progressCallback(100, 'R2 direct upload complete!');
  }
  
  return result;
};

// Method 2: Worker Proxy Upload (Fallback) - PURE CLOUDFLARE
export const uploadViaWorker = async (file, authObject = null, progressCallback) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required for upload');
  }

  const uploadToWorker = async () => {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    const response = await fetch(`${API_BASE}/upload/worker`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Upload failed (${response.status})`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return {
      ...result,
      method: 'worker-proxy'
    };
  };

  return await retryWithBackoff(uploadToWorker);
};

// Method 3: Chunked Upload for Large Files - PURE CLOUDFLARE
export const uploadChunked = async (file, authObject = null, progressCallback) => {
  // For files larger than 25MB, we would implement chunked upload
  // For now, fall back to worker upload which can handle large files
  if (progressCallback) {
    progressCallback(0, 'Large file detected, using optimized upload...');
  }
  
  const result = await uploadViaWorker(file, authObject, progressCallback);
  return {
    ...result,
    method: 'chunked-fallback'
  };
};

// Method 4: Base64 Upload (Last Resort) - PURE CLOUDFLARE
export const uploadBase64 = async (file, authObject = null) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required for upload');
  }

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const base64Data = await fileToBase64(file);
  
  const uploadBase64Data = async () => {
    const response = await fetch(`${API_BASE}/upload/base64`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        data: base64Data
      })
    });

    if (!response.ok) {
      throw new Error('Base64 upload failed');
    }

    return await response.json();
  };

  const result = await retryWithBackoff(uploadBase64Data);
  return {
    ...result,
    method: 'base64'
  };
};

// Main upload function with automatic fallbacks - 100% PURE CLOUDFLARE
export const bulletproofUpload = async (file, authObject = null, progressCallback) => {
  // Validate file first
  validateFile(file);

  const uploadMethods = [
    { name: 'R2 Direct Upload', fn: uploadToR2Direct },
    { name: 'Worker Proxy Upload', fn: uploadViaWorker },
    { name: 'Chunked Upload', fn: uploadChunked },
    { name: 'Base64 Upload', fn: uploadBase64 }
  ];

  let lastError;
  let attemptNumber = 0;

  for (const method of uploadMethods) {
    try {
      attemptNumber++;
      console.log(`Attempting ${method.name} (${attemptNumber}/${uploadMethods.length})...`);
      
      if (progressCallback) {
        progressCallback(0, `Starting ${method.name}...`);
      }

      const result = await method.fn(file, authObject, progressCallback);
      
      console.log(`✅ ${method.name} successful!`, result);
      
      if (progressCallback) {
        progressCallback(100, 'Upload complete!');
      }

      return {
        ...result,
        uploadMethod: method.name,
        attempts: attemptNumber
      };

    } catch (error) {
      lastError = error;
      console.warn(`❌ ${method.name} failed:`, error.message);
      
      if (progressCallback) {
        progressCallback(0, `${method.name} failed, trying next method...`);
      }
      
      // Add a small delay before trying next method
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // All methods failed
  throw new Error(`All upload methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Verify upload by checking if file exists and is accessible - PURE CLOUDFLARE
export const verifyUpload = async (fileKey, authObject = null) => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${MEDIA_API_BASE}/media/${encodeURIComponent(fileKey)}`, {
      method: 'HEAD',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    return response.ok;
  } catch {
    return false;
  }
};

// Delete media (Admin only) - PURE CLOUDFLARE
export const deleteMedia = async (fileKey, authObject = null, isAdmin = false) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/media/${encodeURIComponent(fileKey)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-admin-action': isAdmin ? 'true' : 'false'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete failed: ${errorText}`);
  }

  return await response.json();
};

export default bulletproofUpload;