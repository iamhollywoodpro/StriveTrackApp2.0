// SIMPLE AND RELIABLE UPLOAD SYSTEM
// Built specifically for Cloudflare R2 with Cloudflare Auth (NO SUPABASE!)

const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

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
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/mov', 'video/webm', 'video/avi', 'video/quicktime'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type "${file.type}" not supported. Please use images (JPEG, PNG, WebP, GIF) or videos (MP4, MOV, WebM, AVI).`);
  }

  return true;
};

// Simple retry with exponential backoff
const retryOperation = async (operation, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Main upload function - SIMPLE AND RELIABLE WITH CLOUDFLARE AUTH
export const uploadToR2 = async (file, supabase, progressCallback) => {
  console.log('🚀 Starting simple R2 upload with Cloudflare auth...');
  
  // Validate file
  validateFile(file);
  
  // Get authentication from Cloudflare auth system
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  // Validate token format to prevent header issues
  if (typeof token !== 'string' || token.includes('\n') || token.includes('\r')) {
    throw new Error('Invalid authentication token format. Please log in again.');
  }

  console.log('✅ Authentication valid');
  
  const uploadOperation = async () => {
    if (progressCallback) progressCallback(10, 'Starting upload...');
    
    console.log('📤 Uploading to:', `${API_BASE}/upload`);
    
    // Safely encode filename for headers (remove non-Latin1 characters)
    const safeFileName = file.name.replace(/[^\x00-\xFF]/g, '').trim() || 'uploaded_file';
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-file-name': safeFileName,
        'Content-Type': file.type,
        'Content-Length': file.size.toString()
      },
      body: file
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    if (progressCallback) progressCallback(50, 'Processing response...');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result);
    
    if (progressCallback) progressCallback(90, 'Verifying upload...');
    
    if (!result.key) {
      throw new Error('Upload succeeded but no file key returned');
    }
    
    if (progressCallback) progressCallback(100, 'Upload complete!');
    
    return {
      key: result.key,
      success: true,
      method: 'simple-r2'
    };
  };

  // Execute with retries
  return await retryOperation(uploadOperation);
};

// Verify upload
export const verifyUpload = async (fileKey, supabase) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch(`${API_BASE}/media/${encodeURIComponent(fileKey)}`, {
      method: 'HEAD',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    return response.ok;
  } catch {
    return false;
  }
};

export default uploadToR2;