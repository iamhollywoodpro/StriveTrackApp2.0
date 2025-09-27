import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rftjybtdvfffzqgotdly.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c'


if (!supabaseUrl) { console.error('Missing VITE_SUPABASE_URL at build-time.'); } 
if (!supabaseAnonKey) { console.error('Missing VITE_SUPABASE_ANON_KEY at build-time.'); } 
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if user is admin
export const isAdminUser = (user) => {
  return (user?.email || '').toLowerCase() === 'iamhollywoodpro@protonmail.com'
}

export const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || null
}

// Storage utilities
export const uploadFile = async (bucketName, filePath, file, options = {}) => {
  try {
    const { data, error } = await supabase?.storage?.from(bucketName)?.upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        ...options
      })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { data: null, error }
  }
}

export const getFileUrl = async (bucketName, filePath, isPublic = false) => {
  try {
    if (isPublic) {
      const { data } = supabase?.storage?.from(bucketName)?.getPublicUrl(filePath)
      return { url: data?.publicUrl, error: null }
    } else {
      const { data, error } = await supabase?.storage?.from(bucketName)?.createSignedUrl(filePath, 3600) // 1 hour expiry
      
      if (error) throw error
      return { url: data?.signedUrl, error: null }
    }
  } catch (error) {
    console.error('Get file URL error:', error)
    return { url: null, error }
  }
}

export const deleteFile = async (bucketName, filePath) => {
  try {
    const { data, error } = await supabase?.storage?.from(bucketName)?.remove([filePath])

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { data: null, error }
  }
}
