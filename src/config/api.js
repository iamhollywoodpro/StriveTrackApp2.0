// API Configuration for StriveTrack Social Features
export const API_CONFIG = {
  // Social API (our amazing new backend!) 🚀
  SOCIAL_API_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3003' 
    : 'https://strivetrack-media-api.iamhollywoodpro.workers.dev',
  
  // Main API endpoints (if needed)
  MAIN_API_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : typeof window !== 'undefined' ? window.location.origin : 'https://3000-i8diwm964nb6ljbdespoj-6532622b.e2b.dev'
};

// Helper function to get auth headers
export const getAuthHeaders = (session) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${session?.access_token}`
});

// Helper function to make social API calls
export const socialAPI = {
  // Posts
  async createPost(postData, session) {
    try {
      console.log('🚀 Sending POST request to:', `${API_CONFIG.SOCIAL_API_URL}/api/posts`);
      console.log('📝 Post data:', postData);
      console.log('🔑 Session token:', session?.access_token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/posts`, {
        method: 'POST',
        headers: getAuthHeaders(session),
        body: JSON.stringify(postData)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers));
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status, data);
        return { error: data.error || `HTTP ${response.status}: Failed to create post` };
      }
      
      console.log('✅ Post creation successful!', data);
      return data;
    } catch (error) {
      console.error('💥 Network Error:', error);
      return { error: `Network error: ${error.message}. Please try again.` };
    }
  },

  async getPosts(limit = 20, session) {
    try {
      const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/posts?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(session)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', response.status, data);
        return { error: data.error || `HTTP ${response.status}: Failed to fetch posts` };
      }
      
      return data;
    } catch (error) {
      console.error('Network Error:', error);
      return { error: 'Network error: Failed to fetch posts. Please try again.' };
    }
  },

  async likePost(postId, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(session)
    });
    return response.json();
  },

  // Friends
  async getFriends(session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/friends`, {
      method: 'GET',
      headers: getAuthHeaders(session)
    });
    return response.json();
  },

  async inviteFriend(invitationData, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/friends/invite`, {
      method: 'POST',
      headers: getAuthHeaders(session),
      body: JSON.stringify(invitationData)
    });
    return response.json();
  },

  async addFriend(friendData, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/friends/add`, {
      method: 'POST',
      headers: getAuthHeaders(session),
      body: JSON.stringify(friendData)
    });
    return response.json();
  },

  // Challenges
  async getChallenges(session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/challenges`, {
      method: 'GET',
      headers: getAuthHeaders(session)
    });
    return response.json();
  },

  async createChallenge(challengeData, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/challenges`, {
      method: 'POST',
      headers: getAuthHeaders(session),
      body: JSON.stringify(challengeData)
    });
    return response.json();
  },

  // Leaderboards
  async getLeaderboard(type = 'friends', session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/leaderboard?type=${type}&limit=20`, {
      method: 'GET',
      headers: getAuthHeaders(session)
    });
    return response.json();
  },

  // Chat
  async sendMessage(messageData, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/chat/messages`, {
      method: 'POST',
      headers: getAuthHeaders(session),
      body: JSON.stringify(messageData)
    });
    return response.json();
  },

  async getMessages(friendId, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/chat/messages/${friendId}`, {
      method: 'GET',
      headers: getAuthHeaders(session)
    });
    return response.json();
  },

  // Achievements
  async awardAchievement(achievementData, session) {
    const response = await fetch(`${API_CONFIG.SOCIAL_API_URL}/api/achievements/award`, {
      method: 'POST',
      headers: getAuthHeaders(session),
      body: JSON.stringify(achievementData)
    });
    return response.json();
  }
};