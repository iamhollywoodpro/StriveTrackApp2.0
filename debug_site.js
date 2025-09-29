// Debug login and core functionality
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

async function debugSite() {
  console.log('🎵 Testing StriveTrack 2.0 with Hollywood credentials...');
  
  try {
    // Test login
    console.log('\n1. Testing login...');
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
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, errorText);
      return;
    }

    const authData = await loginResponse.json();
    const token = authData.access_token;
    console.log('✅ Login successful, token acquired');
    
    // Test core endpoints
    console.log('\n2. Testing core endpoints...');
    
    const endpoints = [
      { name: 'Profile', url: `${API_BASE}/profile` },
      { name: 'Achievements', url: `${API_BASE}/achievements` },
      { name: 'Goals', url: `${API_BASE}/goals` },
      { name: 'Habits', url: `${API_BASE}/habits` },
      { name: 'Media', url: `${API_BASE}/media` }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint.name}:`, data.items?.length ?? 'data loaded');
        } else {
          console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
    
    // Test admin access (should work for this user)
    console.log('\n3. Testing admin access...');
    const adminResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin access working, users:', adminData.users?.length || 0);
    } else {
      console.log('❌ Admin access failed:', adminResponse.status);
    }
    
    console.log('\n🎯 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugSite();