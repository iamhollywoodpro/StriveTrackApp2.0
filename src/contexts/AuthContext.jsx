import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isAdminUser } from '../lib/supabase';
import { apiGet, apiSend } from '../lib/api';

console.log('🚀 AuthContext: Using NEW Cloudflare Auth System - NO MORE SUPABASE!');

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Separate async operations object
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        // Use Worker API to load profile
        const profile = await apiGet('/profile', supabase)
        if (profile) {
          // Transform Worker profile format to match expected format
          const transformedProfile = {
            id: userId,
            full_name: profile.name || '',
            bio: profile.bio || '',
            height: profile.targets?.height || '',
            weight: profile.targets?.weight || '',
            goals: profile.targets?.goals || '',
            profile_picture_path: null // Will be set separately if needed
          }
          setUserProfile(transformedProfile)
        }
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },
    
    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    }
  }

  // Protected auth handlers - MUST remain synchronous
  const authStateHandlers = {
    onChange: (event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      setLoading(false)
      
      if (authUser) {
        profileOperations?.load(authUser?.id) // Fire-and-forget
      } else {
        profileOperations?.clear()
      }
    }
  }

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then((result) => {
      const session = result?.data?.session;
      authStateHandlers?.onChange(null, session)
    }).catch((error) => {
      console.error('Initial session error:', error);
      authStateHandlers?.onChange(null, null);
    });

    // Listen for auth changes
    try {
      const unsubscribe = supabase?.auth?.onAuthStateChange?.(
        authStateHandlers?.onChange
      );

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        } else if (unsubscribe?.unsubscribe) {
          unsubscribe.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Auth listener error:', error);
    }
  }, [])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })
      return { user: data?.user, error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error }
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return { user: data?.user, error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user?.id) return { error: new Error('No user logged in') }
    
    try {
      // Use Worker API to update profile
      const profileData = {
        name: updates.full_name,
        bio: updates.bio,
        targets: {
          height: updates.height,
          weight: updates.weight,
          goals: updates.goals
        }
      }
      
      const result = await apiSend('PUT', '/profile', profileData, supabase)
      
      if (result.success) {
        // Update local profile state
        const updatedProfile = {
          ...userProfile,
          full_name: updates.full_name,
          bio: updates.bio,
          height: updates.height,
          weight: updates.weight,
          goals: updates.goals
        }
        setUserProfile(updatedProfile)
      }

      return { data: result, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    isAdmin: isAdminUser(user) || userProfile?.is_admin === true,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}