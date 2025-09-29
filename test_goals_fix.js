#!/usr/bin/env node

const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev';

async function testGoalCreation() {
  // Authenticate
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
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
  
  const authData = await authRes.json();
  const token = authData.access_token;
  
  // Test goal creation
  console.log('🎯 Testing goals creation fix...');
  
  const goalRes = await fetch(`${API_BASE}/api/goals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Test Goal After Fix',
      description: 'This should work now',
      target_date: '2025-12-31'
    })
  });
  
  const goalData = await goalRes.json();
  console.log('Status:', goalRes.status);
  console.log('Response:', goalData);
  
  if (goalRes.ok) {
    console.log('✅ Goals creation is now working!');
  } else {
    console.log('❌ Goals creation still failing');
  }
}

testGoalCreation();