// StriveTrack 2.1 - Pure Cloudflare Authentication
// NO SUPABASE - ONLY Cloudflare D1 + Workers

const API_BASE = 'https://strivetrack-api.iamhollywoodpro.workers.dev/api';

class CloudflareAuth {
  constructor() {
    this.token = localStorage.getItem('strivetrack_token');
    this.user = this.token ? JSON.parse(localStorage.getItem('strivetrack_user') || 'null') : null;
  }

  // Get current authentication state
  getAuthState() {
    return {
      isAuthenticated: !!this.token,
      user: this.user,
      token: this.token
    };
  }

  // Login with email/password
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('strivetrack_token', data.token);
        localStorage.setItem('strivetrack_user', JSON.stringify(data.user));
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Register new user
  async register(email, password, fullName) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('strivetrack_token', data.token);
        localStorage.setItem('strivetrack_user', JSON.stringify(data.user));
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Logout user
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('strivetrack_token');
    localStorage.removeItem('strivetrack_user');
    return { success: true };
  }

  // Make authenticated API request
  async apiRequest(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.logout();
          window.location.href = '/login';
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Check if user is admin
  isAdmin() {
    const adminEmails = ['iamhollywoodpro@protonmail.com', 'iamhollywoodpro@gmail.com'];
    return this.user && adminEmails.includes(this.user.email?.toLowerCase());
  }

  // Validate current session
  async validateSession() {
    if (!this.token) return false;
    
    try {
      const response = await this.apiRequest('/auth/validate');
      return response.valid === true;
    } catch (error) {
      console.warn('Session validation failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const cloudflareAuth = new CloudflareAuth();
export default cloudflareAuth;