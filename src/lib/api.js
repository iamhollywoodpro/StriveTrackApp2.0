// Pure Cloudflare API functions - NO SUPABASE
console.log('🚀 API: Pure Cloudflare Worker Architecture - NO SUPABASE!');

const API_BASE = process.env.API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

// Helper to get auth token
function getAuthToken() {
  return localStorage.getItem('strivetrack_token');
}

// Helper to make authenticated requests
export async function makeAuthenticatedRequest(endpoint, options = {}) {
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
}

// GET request to Cloudflare API
export async function apiGet(path) {
  try {
    return await makeAuthenticatedRequest(path);
  } catch (error) {
    console.error('API GET error:', error);
    throw error;
  }
}

// Send data to Cloudflare API
export async function apiSend(method, path, data) {
  try {
    const options = {
      method,
      ...(data && { body: JSON.stringify(data) })
    };
    
    return await makeAuthenticatedRequest(path, options);
  } catch (error) {
    console.error('API Send error:', error);
    throw error;
  }
}

// Upload file to Cloudflare R2
export async function uploadFile(file, path = '/upload') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}${path}`, {
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
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

// Delete file from Cloudflare R2
export async function deleteFile(fileUrl) {
  try {
    return await apiSend('DELETE', '/media/delete', { fileUrl });
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
}

// Progress photo operations
export const progressPhotoAPI = {
  async getAll() {
    return await apiGet('/progress-photos');
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
    return await apiSend('DELETE', `/progress-photos/${photoId}`);
  }
};

// Workout operations
export const workoutAPI = {
  async getAll() {
    return await apiGet('/workouts');
  },
  
  async create(workoutData) {
    return await apiSend('POST', '/workouts', workoutData);
  },
  
  async update(workoutId, workoutData) {
    return await apiSend('PUT', `/workouts/${workoutId}`, workoutData);
  },
  
  async delete(workoutId) {
    return await apiSend('DELETE', `/workouts/${workoutId}`);
  }
};

// Nutrition operations
export const nutritionAPI = {
  async getAll() {
    return await apiGet('/nutrition');
  },
  
  async create(nutritionData) {
    return await apiSend('POST', '/nutrition', nutritionData);
  },
  
  async update(nutritionId, nutritionData) {
    return await apiSend('PUT', `/nutrition/${nutritionId}`, nutritionData);
  },
  
  async delete(nutritionId) {
    return await apiSend('DELETE', `/nutrition/${nutritionId}`);
  }
};

// Goals operations
export const goalsAPI = {
  async getAll() {
    return await apiGet('/goals');
  },
  
  async create(goalData) {
    return await apiSend('POST', '/goals', goalData);
  },
  
  async update(goalId, goalData) {
    return await apiSend('PUT', `/goals/${goalId}`, goalData);
  },
  
  async delete(goalId) {
    return await apiSend('DELETE', `/goals/${goalId}`);
  }
};

// Achievements operations
export const achievementsAPI = {
  async getAll() {
    return await apiGet('/achievements');
  },
  
  async unlock(achievementId) {
    return await apiSend('POST', `/achievements/${achievementId}/unlock`);
  }
};

// Community operations
export const communityAPI = {
  async getPosts() {
    return await apiGet('/community/posts');
  },
  
  async createPost(postData) {
    return await apiSend('POST', '/community/posts', postData);
  },
  
  async likePost(postId) {
    return await apiSend('POST', `/community/posts/${postId}/like`);
  },
  
  async commentOnPost(postId, comment) {
    return await apiSend('POST', `/community/posts/${postId}/comments`, { comment });
  }
};

export default {
  apiGet,
  apiSend,
  uploadFile,
  deleteFile,
  makeAuthenticatedRequest,
  progressPhotoAPI,
  workoutAPI,
  nutritionAPI,
  goalsAPI,
  achievementsAPI,
  communityAPI
};