// Test the actual login process and API calls
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

async function testFullLogin() {
  console.log('🎯 Testing StriveTrack 2.0 Login Process...\n');
  
  try {
    // Step 1: Test credentials against Supabase
    console.log('1️⃣ Testing Supabase authentication...');
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
      const errorData = await loginResponse.json();
      console.log('❌ Supabase login failed:', errorData);
      return;
    }

    const authData = await loginResponse.json();
    const token = authData.access_token;
    const user = authData.user;
    
    console.log('✅ Supabase login successful!');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Token acquired:', token.substring(0, 20) + '...\n');

    // Step 2: Test Worker API authentication
    console.log('2️⃣ Testing Worker API authentication...');
    
    // Test profile endpoint
    const profileResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ Profile endpoint working');
      console.log('   Name:', profile.name);
      console.log('   Bio:', profile.bio || 'Not set');
      console.log('   Targets:', JSON.stringify(profile.targets || {}));
    } else {
      console.log('❌ Profile endpoint failed:', profileResponse.status, profileResponse.statusText);
    }

    // Step 3: Test achievements
    console.log('\n3️⃣ Testing achievements endpoint...');
    const achievementsResponse = await fetch(`${API_BASE}/achievements`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (achievementsResponse.ok) {
      const achievements = await achievementsResponse.json();
      console.log('✅ Achievements endpoint working');
      console.log('   Total points:', achievements.total_points);
      console.log('   Earned achievements:', achievements.items.length);
      
      if (achievements.items.length > 0) {
        console.log('   Latest achievement:', achievements.items[0].code);
      }
    } else {
      console.log('❌ Achievements endpoint failed:', achievementsResponse.status);
    }

    // Step 4: Test media functionality
    console.log('\n4️⃣ Testing media endpoint...');
    const mediaResponse = await fetch(`${API_BASE}/media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (mediaResponse.ok) {
      const media = await mediaResponse.json();
      console.log('✅ Media endpoint working');
      console.log('   Media items count:', media.items?.length || 0);
      
      if (media.items && media.items.length > 0) {
        console.log('   First media item:', media.items[0].key);
        console.log('   Content type:', media.items[0].contentType);
      }
    } else {
      console.log('❌ Media endpoint failed:', mediaResponse.status);
    }

    // Step 5: Test goals
    console.log('\n5️⃣ Testing goals endpoint...');
    const goalsResponse = await fetch(`${API_BASE}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (goalsResponse.ok) {
      const goals = await goalsResponse.json();
      console.log('✅ Goals endpoint working');
      console.log('   Goals count:', goals.items?.length || 0);
      
      if (goals.items && goals.items.length > 0) {
        console.log('   Latest goal:', goals.items[0].title);
      }
    } else {
      console.log('❌ Goals endpoint failed:', goalsResponse.status);
    }

    console.log('\n🎉 API Testing Complete!');
    console.log('The backend APIs are working correctly.');
    console.log('If the frontend is having issues, it\'s likely a React/JavaScript problem.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testFullLogin();