import React, { createContext, useContext, useState, useEffect } from 'react';
import cloudflareAuth from './cloudflare-auth';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const authState = cloudflareAuth.getAuthState();
      
      if (authState.isAuthenticated) {
        // Validate the session
        const isValid = await cloudflareAuth.validateSession();
        
        if (isValid) {
          setIsAuthenticated(true);
          setUser(authState.user);
        } else {
          // Session expired, clear auth
          cloudflareAuth.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    const result = await cloudflareAuth.login(email, password);
    
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
    }
    
    return result;
  };

  // Register function
  const register = async (email, password, fullName) => {
    const result = await cloudflareAuth.register(email, password, fullName);
    
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
    }
    
    return result;
  };

  // Logout function
  const logout = () => {
    cloudflareAuth.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // API request helper
  const apiRequest = async (endpoint, options = {}) => {
    return await cloudflareAuth.apiRequest(endpoint, options);
  };

  // Check if user is admin
  const isAdmin = () => {
    return cloudflareAuth.isAdmin();
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    apiRequest,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}