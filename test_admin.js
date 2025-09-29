// Test admin functionality
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

async function testAdmin() {
  try {
    // Login as admin
    const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: 'iamhollywoodpro@protonmail.com',
        password: 'iampassword@1981'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Admin login failed');
    }

    const authData = await loginResponse.json();
    const token = authData.access_token;
    
    console.log('✅ Admin login successful');
    
    // Test admin users endpoint
    const usersResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Admin users endpoint working, count:', users.users?.length || 0);
      
      if (users.users?.length > 0) {
        const testUserId = users.users[0].id;
        
        // Test admin user profile
        const profileResponse = await fetch(`${API_BASE}/admin/user/${testUserId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY
          }
        });
        
        if (profileResponse.ok) {
          console.log('✅ Admin user profile endpoint working');
        } else {
          console.log('❌ Admin user profile failed:', profileResponse.status);
        }
        
        // Test admin user media
        const mediaResponse = await fetch(`${API_BASE}/admin/user/${testUserId}/media`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY
          }
        });
        
        if (mediaResponse.ok) {
          const media = await mediaResponse.json();
          console.log('✅ Admin user media endpoint working, count:', media.media?.length || 0);
        } else {
          console.log('❌ Admin user media failed:', mediaResponse.status);
        }
      }
    } else {
      console.log('❌ Admin users endpoint failed:', usersResponse.status);
    }
    
    console.log('🎉 Admin tests completed!');
    
  } catch (error) {
    console.error('❌ Admin test failed:', error.message);
  }
}

testAdmin();