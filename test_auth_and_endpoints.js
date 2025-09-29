const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c'
const WORKER_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'

async function testAuthentication() {
  console.log('🔐 Testing Supabase authentication...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  try {
    // Test user account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'iamhollywoodpro@gmail.com',
      password: 'Hollywood@1981'
    })
    
    if (error) {
      console.error('❌ Authentication failed:', error.message)
      return null
    }
    
    console.log('✅ Authentication successful!')
    console.log('User ID:', data.user.id)
    console.log('Email:', data.user.email)
    
    return data.session.access_token
    
  } catch (err) {
    console.error('❌ Authentication error:', err)
    return null
  }
}

async function testWorkerEndpoints(token) {
  console.log('\n🔗 Testing Worker endpoints...')
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  try {
    // Test health endpoint
    console.log('\n📊 Testing /api/health...')
    let response = await fetch(`${WORKER_URL}/api/health`)
    let data = await response.json()
    console.log('Health:', response.status, data)
    
    // Test profile endpoint (should create default if none exists)
    console.log('\n👤 Testing /api/profile...')
    response = await fetch(`${WORKER_URL}/api/profile`, { headers })
    data = await response.json()
    console.log('Profile GET:', response.status, data)
    
    // Test goals endpoint
    console.log('\n🎯 Testing /api/goals...')
    response = await fetch(`${WORKER_URL}/api/goals`, { headers })
    data = await response.json()
    console.log('Goals:', response.status, data)
    
    // Test achievements endpoint
    console.log('\n🏆 Testing /api/achievements...')
    response = await fetch(`${WORKER_URL}/api/achievements`, { headers })
    data = await response.json()
    console.log('Achievements:', response.status, data)
    
    // Test media endpoint
    console.log('\n📸 Testing /api/media...')
    response = await fetch(`${WORKER_URL}/api/media`, { headers })
    data = await response.json()
    console.log('Media:', response.status, data)
    
    // Test nutrition endpoint (with today's date)
    const today = new Date().toISOString().split('T')[0]
    console.log(`\n🍎 Testing /api/nutrition?date=${today}...`)
    response = await fetch(`${WORKER_URL}/api/nutrition?date=${today}`, { headers })
    data = await response.json()
    console.log('Nutrition:', response.status, data)
    
    return true
    
  } catch (err) {
    console.error('❌ Worker endpoint error:', err)
    return false
  }
}

async function main() {
  console.log('🚀 StriveTrack 2.0 - Testing Authentication & Endpoints')
  console.log('=' .repeat(50))
  
  const token = await testAuthentication()
  if (!token) {
    console.log('\n❌ Cannot proceed without authentication token')
    return
  }
  
  const success = await testWorkerEndpoints(token)
  
  console.log('\n' + '='.repeat(50))
  console.log(success ? '✅ All tests completed successfully!' : '❌ Some tests failed')
  console.log('Token available for manual testing:', token.substring(0, 20) + '...')
}

main().catch(console.error)