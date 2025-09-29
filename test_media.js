// Test script to verify media functionality
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

async function testAuth() {
  try {
    // Test with test user credentials
    const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: 'iamhollywoodpro@gmail.com',
        password: 'Hollywood@1981'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const authData = await loginResponse.json();
    const token = authData.access_token;
    
    console.log('✅ Login successful, token acquired');
    
    // Test profile endpoint
    const profileResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ Profile endpoint working:', profile);
    } else {
      console.log('❌ Profile endpoint failed:', profileResponse.status);
    }
    
    // Test achievements endpoint
    const achievementsResponse = await fetch(`${API_BASE}/achievements`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (achievementsResponse.ok) {
      const achievements = await achievementsResponse.json();
      console.log('✅ Achievements endpoint working, total points:', achievements.total_points);
    } else {
      console.log('❌ Achievements endpoint failed:', achievementsResponse.status);
    }
    
    // Test media list endpoint
    const mediaResponse = await fetch(`${API_BASE}/media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (mediaResponse.ok) {
      const media = await mediaResponse.json();
      console.log('✅ Media endpoint working, items count:', media.items?.length || 0);
    } else {
      console.log('❌ Media endpoint failed:', mediaResponse.status);
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();