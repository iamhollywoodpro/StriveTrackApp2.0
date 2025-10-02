// Cloudflare API integration for StriveTrack 2.1
// This service handles all data persistence with Cloudflare D1 database

const API_BASE = 'https://strivetrack.hollywood-1988.workers.dev'; // Replace with your Worker URL

class StriveTrackAPI {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // Helper method to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(email, password, fullName) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName })
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Habits API
  async getHabits() {
    return this.request('/habits');
  }

  async createHabit(habitData) {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData)
    });
  }

  async updateHabit(habitId, habitData) {
    return this.request(`/habits/${habitId}`, {
      method: 'PUT',
      body: JSON.stringify(habitData)
    });
  }

  async deleteHabit(habitId) {
    return this.request(`/habits/${habitId}`, {
      method: 'DELETE'
    });
  }

  async logHabitProgress(habitId, completed = true, notes = '') {
    return this.request(`/habits/${habitId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ 
        completed, 
        notes,
        logged_at: new Date().toISOString()
      })
    });
  }

  async getHabitProgress(habitId, days = 30) {
    return this.request(`/habits/${habitId}/progress?days=${days}`);
  }

  // Goals API
  async getGoals() {
    return this.request('/goals');
  }

  async createGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  }

  async updateGoal(goalId, goalData) {
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData)
    });
  }

  async deleteGoal(goalId) {
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE'
    });
  }

  async updateGoalProgress(goalId, currentValue, notes = '') {
    return this.request(`/goals/${goalId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ 
        current_value: currentValue, 
        notes,
        updated_at: new Date().toISOString()
      })
    });
  }

  // Nutrition API
  async getMeals(date = null) {
    const dateParam = date ? `?date=${date}` : '';
    return this.request(`/nutrition/meals${dateParam}`);
  }

  async createMeal(mealData) {
    return this.request('/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify({
        ...mealData,
        logged_at: new Date().toISOString()
      })
    });
  }

  async updateMeal(mealId, mealData) {
    return this.request(`/nutrition/meals/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(mealData)
    });
  }

  async deleteMeal(mealId) {
    return this.request(`/nutrition/meals/${mealId}`, {
      method: 'DELETE'
    });
  }

  async getFoods() {
    return this.request('/nutrition/foods');
  }

  async createFood(foodData) {
    return this.request('/nutrition/foods', {
      method: 'POST',
      body: JSON.stringify(foodData)
    });
  }

  async updateFood(foodId, foodData) {
    return this.request(`/nutrition/foods/${foodId}`, {
      method: 'PUT',
      body: JSON.stringify(foodData)
    });
  }

  async deleteFood(foodId) {
    return this.request(`/nutrition/foods/${foodId}`, {
      method: 'DELETE'
    });
  }

  async getNutritionSummary(startDate, endDate) {
    return this.request(`/nutrition/summary?start_date=${startDate}&end_date=${endDate}`);
  }

  async logWaterIntake(glasses = 1) {
    return this.request('/nutrition/water', {
      method: 'POST',
      body: JSON.stringify({ 
        glasses,
        logged_at: new Date().toISOString()
      })
    });
  }

  // Media API (for Phase 4)
  async uploadMedia(file, type = 'progress_photo', description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('description', description);

    return this.request('/media/upload', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
  }

  async getMedia(type = null, limit = 50) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit);
    
    return this.request(`/media?${params}`);
  }

  async deleteMedia(mediaId) {
    return this.request(`/media/${mediaId}`, {
      method: 'DELETE'
    });
  }

  // Admin API (for Phase 6)
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllMedia(page = 1, limit = 20) {
    return this.request(`/admin/media?page=${page}&limit=${limit}`);
  }

  async flagMedia(mediaId, reason) {
    return this.request(`/admin/media/${mediaId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async unflagMedia(mediaId) {
    return this.request(`/admin/media/${mediaId}/unflag`, {
      method: 'POST'
    });
  }

  // Analytics API
  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getHabitsAnalytics(days = 30) {
    return this.request(`/analytics/habits?days=${days}`);
  }

  async getNutritionAnalytics(days = 7) {
    return this.request(`/analytics/nutrition?days=${days}`);
  }
}

// Export singleton instance
export const api = new StriveTrackAPI();
export default api;