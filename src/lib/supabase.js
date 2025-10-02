// PURE CLOUDFLARE ARCHITECTURE - NO SUPABASE!
// This file maintains compatibility with existing imports but uses only Cloudflare

console.log('🚀 Pure Cloudflare Auth & Storage - NO SUPABASE DEPENDENCIES!');

// Helper function to check if user is admin
export const isAdminUser = (user) => {
  const adminEmails = ['iamhollywoodpro@protonmail.com'];
  return user && adminEmails.includes((user.email || '').toLowerCase());
};

// Get auth token from localStorage (Cloudflare format)
export const getAccessToken = () => {
  return localStorage.getItem('strivetrack_token');
};

// Cloudflare R2 Storage utilities
const MEDIA_API_BASE = process.env.MEDIA_API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

export const uploadFile = async (bucketName, filePath, file, options = {}) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('Authentication required for upload');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucketName);
    formData.append('path', filePath);
    
    // Add any additional options
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    const response = await fetch(`${MEDIA_API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return {
      data: {
        path: result.url,
        fullPath: result.path,
        id: result.id || filePath,
        Key: result.key || filePath
      },
      error: null
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      data: null,
      error: error
    };
  }
};

export const deleteFile = async (bucketName, filePath) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('Authentication required for delete');
    }

    const response = await fetch(`${MEDIA_API_BASE}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        bucket: bucketName,
        path: filePath
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Delete failed');
    }

    return {
      data: result,
      error: null
    };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      data: null,
      error: error
    };
  }
};

export const getPublicUrl = (bucketName, filePath) => {
  // Return the Cloudflare R2 public URL
  return {
    data: {
      publicUrl: `${MEDIA_API_BASE}/public/${bucketName}/${filePath}`
    }
  };
};

// Mock supabase object for compatibility with existing code
export const supabase = {
  auth: {
    getSession: () => {
      const token = getAccessToken();
      const userData = localStorage.getItem('strivetrack_user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        return Promise.resolve({
          data: {
            session: {
              access_token: token,
              user: user
            }
          },
          error: null
        });
      }
      
      return Promise.resolve({
        data: { session: null },
        error: null
      });
    },
    
    signInWithPassword: async ({ email, password }) => {
      try {
        const response = await fetch(`${MEDIA_API_BASE.replace('/api', '/api')}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          localStorage.setItem('strivetrack_token', data.token);
          if (data.user) {
            localStorage.setItem('strivetrack_user', JSON.stringify(data.user));
          }
          
          return {
            data: {
              user: data.user,
              session: {
                access_token: data.token,
                user: data.user
              }
            },
            error: null
          };
        } else {
          return {
            data: { user: null, session: null },
            error: { message: data.message || 'Login failed' }
          };
        }
      } catch (error) {
        return {
          data: { user: null, session: null },
          error: { message: error.message || 'Network error' }
        };
      }
    },
    
    signUp: async ({ email, password, options = {} }) => {
      try {
        const response = await fetch(`${MEDIA_API_BASE.replace('/api', '/api')}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            full_name: options.data?.full_name || ''
          })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          localStorage.setItem('strivetrack_token', data.token);
          if (data.user) {
            localStorage.setItem('strivetrack_user', JSON.stringify(data.user));
          }
          
          return {
            data: {
              user: data.user,
              session: {
                access_token: data.token,
                user: data.user
              }
            },
            error: null
          };
        } else {
          return {
            data: { user: null, session: null },
            error: { message: data.message || 'Registration failed' }
          };
        }
      } catch (error) {
        return {
          data: { user: null, session: null },
          error: { message: error.message || 'Network error' }
        };
      }
    },
    
    signOut: async () => {
      localStorage.removeItem('strivetrack_token');
      localStorage.removeItem('strivetrack_user');
      return {
        error: null
      };
    }
  },
  
  storage: {
    from: (bucketName) => ({
      upload: (path, file, options) => uploadFile(bucketName, path, file, options),
      remove: (paths) => {
        if (Array.isArray(paths)) {
          return Promise.all(paths.map(path => deleteFile(bucketName, path)));
        }
        return deleteFile(bucketName, paths);
      },
      getPublicUrl: (path) => getPublicUrl(bucketName, path)
    })
  }
};

export default supabase;