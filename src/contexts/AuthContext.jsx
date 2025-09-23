import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isAdminUser } from '../lib/supabase';

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
        // Fix: Use 'profiles' table instead of 'user_profiles'
        const { data, error } = await supabase?.from('profiles')?.select('*')?.eq('id', userId)?.single()
        
        if (!error && data) {
          setUserProfile(data)
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
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    )

    return () => subscription?.unsubscribe()
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
      // Fix: Use 'profiles' table instead of 'user_profiles'
      const { data, error } = await supabase?.from('profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()

      if (!error && data) {
        setUserProfile(data)
      }

      return { data, error }
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