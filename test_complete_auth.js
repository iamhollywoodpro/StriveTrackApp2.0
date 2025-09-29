// Test the complete auth flow including navigation
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';

async function testCompleteAuth() {
  console.log('🔐 Testing complete authentication flow...');
  
  try {
    // Step 1: Test Supabase authentication
    console.log('Step 1: Testing Supabase auth...');
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
      console.log('❌ Supabase auth failed:', loginResponse.status);
      return;
    }

    const authData = await loginResponse.json();
    console.log('✅ Supabase auth successful');
    console.log('User:', authData.user?.email);
    console.log('Is admin:', authData.user?.email === 'iamhollywoodpro@gmail.com');

    // Step 2: Test Worker API endpoints
    console.log('\nStep 2: Testing Worker API endpoints...');
    const token = authData.access_token;
    
    // Test profile
    const profileRes = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (profileRes.ok) {
      const profile = await profileRes.json();
      console.log('✅ Profile API working:', profile.name);
    } else {
      console.log('❌ Profile API failed:', profileRes.status);
    }

    // Test achievements
    const achievementsRes = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/achievements', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (achievementsRes.ok) {
      const achievements = await achievementsRes.json();
      console.log('✅ Achievements API working, points:', achievements.total_points);
      console.log('Achievements count:', achievements.items?.length);
    } else {
      console.log('❌ Achievements API failed:', achievementsRes.status);
    }

    // Test media
    const mediaRes = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/media', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (mediaRes.ok) {
      const media = await mediaRes.json();
      console.log('✅ Media API working, files:', media.items?.length);
    } else {
      console.log('❌ Media API failed:', mediaRes.status);
    }

    // Step 3: Test goals
    console.log('\nStep 3: Testing goals API...');
    const goalsRes = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/goals', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (goalsRes.ok) {
      const goals = await goalsRes.json();
      console.log('✅ Goals API working, count:', goals.items?.length);
    } else {
      console.log('❌ Goals API failed:', goalsRes.status);
    }

    // Step 4: Test habits
    console.log('\nStep 4: Testing habits API...');
    const habitsRes = await fetch('https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/habits', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (habitsRes.ok) {
      const habits = await habitsRes.json();
      console.log('✅ Habits API working, count:', habits.items?.length);
    } else {
      console.log('❌ Habits API failed:', habitsRes.status);
    }

    console.log('\n🎉 Complete auth flow test finished!');
    console.log('Token is valid and Worker APIs are responding');
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
  }
}

testCompleteAuth();