// REPLACED SUPABASE WITH CLOUDFLARE AUTH!
import { supabase, cloudflareAuth } from './cloudflareAuth.js';

// Export the Cloudflare auth client as supabase for compatibility
export { supabase };

// Helper function to check if user is admin
export const isAdminUser = (user) => {
  return (user?.email || '').toLowerCase() === 'iamhollywoodpro@protonmail.com'
}

export const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || null
}

// Storage utilities - NOW USING CLOUDFLARE R2!
const MEDIA_API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

export const uploadFile = async (bucketName, filePath, file, options = {}) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    if (!token) {
      throw new Error('Authentication required for upload');
    }

    const response = await fetch(`${MEDIA_API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-file-name': filePath || file.name,
        'Content-Type': file.type
      },
      body: file
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    return { 
      data: { 
        path: result.key,
        fullPath: result.key,
        key: result.key
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error: { message: error.message } };
  }
}

export const getFileUrl = async (bucketName, filePath, isPublic = false) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    // Build Cloudflare media URL
    let url = `${MEDIA_API_BASE}/media/${encodeURIComponent(filePath)}`;
    if (token) {
      url += `?token=${encodeURIComponent(token)}`;
    }
    
    return { url, error: null };
  } catch (error) {
    console.error('Get file URL error:', error);
    return { url: null, error: { message: error.message } };
  }
}

export const deleteFile = async (bucketName, filePath) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    if (!token) {
      throw new Error('Authentication required for delete');
    }

    const response = await fetch(`${MEDIA_API_BASE}/media/${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Delete failed: ${errorText}`);
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { data: null, error: { message: error.message } };
  }
}
