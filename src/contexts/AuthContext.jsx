import React, { createContext, useContext, useEffect, useState } from 'react';

console.log('🚀 AuthContext: Pure Cloudflare Architecture - NO SUPABASE!');

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Cloudflare API configuration
const API_BASE = 'https://strivetrack-api.iamhollywoodpro.workers.dev/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('strivetrack_token');
    
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

  // Profile operations
  const profileOperations = {
    async load(userId) {
      if (!userId || !localStorage.getItem('strivetrack_token')) return;
      
      setProfileLoading(true);
      try {
        const profile = await makeAuthenticatedRequest('/profile');
        if (profile) {
          const transformedProfile = {
            id: userId,
            full_name: profile.name || '',
            bio: profile.bio || '',
            height: profile.targets?.height || '',
            weight: profile.targets?.weight || '',
            goals: profile.targets?.goals || '',
            profile_picture_path: null
          };
          setUserProfile(transformedProfile);
        }
      } catch (error) {
        console.error('Profile load error:', error);
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('strivetrack_token');
      const userData = localStorage.getItem('strivetrack_user');
      
      if (token && userData) {
        try {
          // Verify token is still valid with Cloudflare API
          const response = await makeAuthenticatedRequest('/auth/verify');
          if (response.success) {
            const user = JSON.parse(userData);
            setUser(user);
            document.title = 'Dashboard | StriveTracker - A Complete Fitness Tracker Reimagined';
            profileOperations.load(user.id);
          } else {
            // Token invalid, clear auth
            clearAuth();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuth();
        }
      } else {
        document.title = 'Sign In | StriveTracker - A Complete Fitness Tracker Reimagined';
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('strivetrack_token');
    localStorage.removeItem('strivetrack_user');
    setUser(null);
    profileOperations.clear();
    document.title = 'Sign In | StriveTracker - A Complete Fitness Tracker Reimagined';
  };

  // Sign in with Cloudflare API
  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('strivetrack_token', data.token);
        if (data.user) {
          localStorage.setItem('strivetrack_user', JSON.stringify(data.user));
          setUser(data.user);
          profileOperations.load(data.user.id);
        }
        
        return { user: data.user, error: null };
      } else {
        return { user: null, error: { message: data.message || 'Login failed' } };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: { message: 'Network error. Please try again.' } };
    }
  };

  // Sign up with Cloudflare API
  const signUp = async (email, password, metadata = {}) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: metadata.full_name || ''
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('strivetrack_token', data.token);
        if (data.user) {
          localStorage.setItem('strivetrack_user', JSON.stringify(data.user));
          setUser(data.user);
          profileOperations.load(data.user.id);
        }
        
        return { user: data.user, error: null };
      } else {
        return { user: null, error: { message: data.message || 'Registration failed' } };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: { message: 'Network error. Please try again.' } };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Optional: Call logout endpoint to invalidate token on server
      await makeAuthenticatedRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with client-side logout even if server call fails
      console.error('Server logout error:', error);
    }
    
    clearAuth();
    return { error: null };
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user?.id) return { error: new Error('No user logged in') };
    
    try {
      const profileData = {
        name: updates.full_name,
        bio: updates.bio,
        height: updates.height,
        weight: updates.weight,
        goals: updates.goals
      };

      const result = await makeAuthenticatedRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (result.success) {
        // Update local profile state
        const updatedProfile = { ...userProfile, ...updates };
        setUserProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      } else {
        return { data: null, error: new Error(result.message || 'Update failed') };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  };

  // Check if user is admin (simple email-based check)
  const isAdminUser = (user) => {
    const adminEmails = ['iamhollywoodpro@protonmail.com'];
    return user && adminEmails.includes(user.email?.toLowerCase());
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdminUser: isAdminUser(user),
    makeAuthenticatedRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;