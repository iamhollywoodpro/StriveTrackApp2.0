// Cloudflare-native Authentication Service
// NO MORE SUPABASE DEPENDENCY!

const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

class CloudflareAuth {
  constructor() {
    this.token = localStorage.getItem('cf_auth_token');
    this.user = null;
    this.listeners = [];
  }

  // Event system for auth state changes - Supabase compatible
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.user ? 'SIGNED_IN' : 'SIGNED_OUT', { user: this.user });
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }

  notifyListeners(event, session) {
    this.listeners.forEach(callback => callback(event, session));
  }

  // Get current session
  async getSession() {
    if (!this.token) {
      return { data: { session: null }, error: null };
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        return {
          data: {
            session: {
              access_token: this.token,
              user: data.user
            }
          },
          error: null
        };
      } else {
        // Token expired or invalid
        this.token = null;
        this.user = null;
        localStorage.removeItem('cf_auth_token');
        return { data: { session: null }, error: null };
      }
    } catch (error) {
      console.error('Session check error:', error);
      return { data: { session: null }, error };
    }
  }

  // Sign up with email and password
  async signUp({ email, password, options = {} }) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name: options.data?.full_name || email.split('@')[0]
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('cf_auth_token', this.token);
        
        this.notifyListeners('SIGNED_UP', {
          user: this.user,
          session: { access_token: this.token, user: this.user }
        });

        return { data: { user: this.user, session: { access_token: this.token, user: this.user } }, error: null };
      } else {
        return { data: null, error: { message: data.error } };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  // Sign in with email and password
  async signInWithPassword({ email, password }) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('cf_auth_token', this.token);
        
        this.notifyListeners('SIGNED_IN', {
          user: this.user,
          session: { access_token: this.token, user: this.user }
        });

        return { data: { user: this.user, session: { access_token: this.token, user: this.user } }, error: null };
      } else {
        return { data: null, error: { message: data.error } };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  // Sign out
  async signOut() {
    try {
      if (this.token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
      }

      this.token = null;
      this.user = null;
      localStorage.removeItem('cf_auth_token');
      
      this.notifyListeners('SIGNED_OUT', { user: null, session: null });

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: error.message } };
    }
  }

  // Update user profile (placeholder for compatibility)
  async updateUser(updates) {
    // For now, just return success - implement if needed
    return { data: { user: { ...this.user, ...updates } }, error: null };
  }
}

// Create singleton instance
export const cloudflareAuth = new CloudflareAuth();

// Export auth object with Supabase-compatible interface
export const auth = {
  getSession: () => cloudflareAuth.getSession(),
  signUp: (credentials) => cloudflareAuth.signUp(credentials),
  signInWithPassword: (credentials) => cloudflareAuth.signInWithPassword(credentials),
  signOut: () => cloudflareAuth.signOut(),
  updateUser: (updates) => cloudflareAuth.updateUser(updates),
  onAuthStateChange: (callback) => cloudflareAuth.onAuthStateChange(callback)
};

// Export a Supabase-compatible client object
export const supabase = {
  auth,
  // Add other methods as needed for compatibility
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null })
  })
};

// Check auth state on load
cloudflareAuth.getSession().then(result => {
  if (result.data.session) {
    cloudflareAuth.notifyListeners('INITIAL_SESSION', result.data.session);
  }
});

export default cloudflareAuth;