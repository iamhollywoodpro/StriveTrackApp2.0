// PURE CLOUDFLARE UTILITIES - NO SUPABASE!
console.log('🚀 Pure Cloudflare Utilities - 100% Cloudflare Architecture!');

const API_BASE = 'https://strivetrack-api.iamhollywoodpro.workers.dev/api';

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('strivetrack_token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userData = localStorage.getItem('strivetrack_user');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is admin
export const isAdminUser = (user = null) => {
  const currentUser = user || getCurrentUser();
  const adminEmails = ['iamhollywoodpro@protonmail.com'];
  return currentUser && adminEmails.includes((currentUser.email || '').toLowerCase());
};

// Make authenticated request to Cloudflare API
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
};

// Authentication functions
export const auth = {
  async signInWithPassword({ email, password }) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
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
          data: { user: data.user },
          error: null
        };
      } else {
        return {
          data: { user: null },
          error: { message: data.message || 'Login failed' }
        };
      }
    } catch (error) {
      return {
        data: { user: null },
        error: { message: error.message || 'Network error' }
      };
    }
  },

  async signUp({ email, password, options = {} }) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
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
          data: { user: data.user },
          error: null
        };
      } else {
        return {
          data: { user: null },
          error: { message: data.message || 'Registration failed' }
        };
      }
    } catch (error) {
      return {
        data: { user: null },
        error: { message: error.message || 'Network error' }
      };
    }
  },

  async signOut() {
    localStorage.removeItem('strivetrack_token');
    localStorage.removeItem('strivetrack_user');
    return { error: null };
  },

  async getSession() {
    const token = getAuthToken();
    const user = getCurrentUser();
    
    return {
      data: {
        session: token ? { access_token: token, user } : null
      },
      error: null
    };
  }
};

// File storage functions for Cloudflare R2
export const storage = {
  from: (bucketName) => ({
    async upload(path, file, options = {}) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('Authentication required for upload');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucketName);
        formData.append('path', path);
        
        // Add any additional options
        Object.keys(options).forEach(key => {
          formData.append(key, options[key]);
        });

        const response = await fetch(`${API_BASE}/upload`, {
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
            id: result.id || path,
            Key: result.key || path
          },
          error: null
        };
      } catch (error) {
        return {
          data: null,
          error: error
        };
      }
    },

    async remove(paths) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('Authentication required for delete');
        }

        const pathsToDelete = Array.isArray(paths) ? paths : [paths];
        
        const promises = pathsToDelete.map(async (path) => {
          const response = await fetch(`${API_BASE}/delete`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              bucket: bucketName,
              path: path
            })
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.message || 'Delete failed');
          }

          return result;
        });

        const results = await Promise.all(promises);
        
        return {
          data: results,
          error: null
        };
      } catch (error) {
        return {
          data: null,
          error: error
        };
      }
    },

    getPublicUrl: (path) => {
      return {
        data: {
          publicUrl: `${API_BASE}/public/${bucketName}/${path}`
        }
      };
    }
  })
};

// Progress Photos API
export const progressPhotosAPI = {
  async getAll() {
    return await makeAuthenticatedRequest('/progress-photos');
  },
  
  async upload(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/progress-photos/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data;
  },
  
  async delete(photoId) {
    return await makeAuthenticatedRequest(`/progress-photos/${photoId}`, {
      method: 'DELETE'
    });
  }
};

// Default export with all utilities
export default {
  auth,
  storage,
  isAdminUser,
  getAuthToken,
  getCurrentUser,
  makeAuthenticatedRequest,
  progressPhotosAPI
};