// Test the actual site login flow
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';

async function testSiteLogin() {
  console.log('🧪 Testing site login flow...');
  
  try {
    // Test Supabase auth directly
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
      console.log('❌ Login failed:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('Error details:', error);
      return;
    }

    const authData = await loginResponse.json();
    console.log('✅ Supabase login successful');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);
    
    // Test Worker API with token
    const token = authData.access_token;
    const apiResponse = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (apiResponse.ok) {
      const profile = await apiResponse.json();
      console.log('✅ Worker API profile access working');
      console.log('Profile:', profile);
    } else {
      console.log('❌ Worker API profile failed:', apiResponse.status);
    }

    // Test achievements
    const achievementsResponse = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/achievements', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (achievementsResponse.ok) {
      const achievements = await achievementsResponse.json();
      console.log('✅ Achievements working, total points:', achievements.total_points);
    } else {
      console.log('❌ Achievements failed:', achievementsResponse.status);
    }

    console.log('🎉 Site login test completed!');
    
  } catch (error) {
    console.error('❌ Site test failed:', error.message);
  }
}

testSiteLogin();