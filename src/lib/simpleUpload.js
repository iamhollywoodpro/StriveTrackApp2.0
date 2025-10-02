// Simple Upload System - 100% PURE CLOUDFLARE - NO SUPABASE!
// Built specifically for Cloudflare R2 with pure Cloudflare Auth

import { getAuthToken } from './cloudflare';

console.log('🚀 Simple Upload: Pure Cloudflare Architecture - NO SUPABASE!');

const API_BASE = process.env.API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
const MEDIA_API_BASE = process.env.MEDIA_API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

// Upload file to R2 via Cloudflare Workers - PURE CLOUDFLARE
export const uploadToR2 = async (file, authObject = null, progressCallback) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required for upload');
  }

  if (progressCallback) {
    progressCallback(10, 'Starting Cloudflare R2 upload...');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (progressCallback) {
      progressCallback(70, 'Processing upload...');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();

    if (progressCallback) {
      progressCallback(100, 'Upload complete!');
    }

    console.log('✅ Cloudflare R2 upload successful:', result);
    return result;

  } catch (error) {
    console.error('❌ Cloudflare R2 upload failed:', error);
    throw error;
  }
};

// Verify upload by checking if file exists - PURE CLOUDFLARE
export const verifyUpload = async (fileKey, authObject = null) => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${MEDIA_API_BASE}/media/${encodeURIComponent(fileKey)}`, {
      method: 'HEAD',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    const isVerified = response.ok;
    console.log(`🔍 File verification for ${fileKey}:`, isVerified ? '✅ Found' : '❌ Not found');
    return isVerified;
  } catch (error) {
    console.error('❌ File verification failed:', error);
    return false;
  }
};

// Delete media file - PURE CLOUDFLARE
export const deleteMedia = async (fileKey, authObject = null, isAdmin = false) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
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

    const result = await response.json();
    console.log('✅ File deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ File deletion failed:', error);
    throw error;
  }
};

export default {
  uploadToR2,
  verifyUpload,
  deleteMedia
};