#!/usr/bin/env node

/**
 * StriveTrack 2.0 API Test Script
 * Tests key functionality of the Worker API with Supabase authentication
 */

const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev';
const TEST_EMAIL = 'iamhollywoodpro@gmail.com';
const TEST_PASSWORD = 'Hollywood@1981';

let accessToken = null;
let userId = null;

async function authenticateUser(email, password) {
  console.log('🔐 Authenticating with Supabase...');
  
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Authentication failed: ${response.status} ${error}`);
  }
  
  const data = await response.json();
  accessToken = data.access_token;
  userId = data.user?.id;
  
  console.log(`✅ Authenticated! User ID: ${userId}`);
  return { accessToken, userId };
}

async function testWorkerEndpoint(method, endpoint, body = null) {
  console.log(`🧪 Testing ${method} ${endpoint}`);
  
  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const responseText = await response.text();
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    data = responseText;
  }
  
  console.log(`   Status: ${response.status}`);
  console.log(`   Response:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  
  return { status: response.status, data, ok: response.ok };
}

async function runTests() {
  try {
    console.log('🚀 Starting StriveTrack 2.0 API Tests\n');
    
    // 1. Authenticate
    await authenticateUser(TEST_EMAIL, TEST_PASSWORD);
    console.log('');
    
    // 2. Test Health Check
    await testWorkerEndpoint('GET', '/api/health');
    console.log('');
    
    // 3. Test Profile Endpoints
    console.log('📋 Testing Profile Endpoints');
    await testWorkerEndpoint('GET', '/api/profile');
    
    await testWorkerEndpoint('PUT', '/api/profile', {
      name: 'Hollywood Producer',
      bio: 'Music producer and entrepreneur from Fresh Blendz',
      targets: {
        weight: '180 lbs',
        height: '5\'10"',
        goals: 'Build muscle and increase energy for creative work'
      }
    });
    console.log('');
    
    // 4. Test Goals
    console.log('🎯 Testing Goals Endpoints');
    await testWorkerEndpoint('GET', '/api/goals');
    
    await testWorkerEndpoint('POST', '/api/goals', {
      title: 'Daily Morning Workout',
      description: 'Complete 30 minutes of exercise before studio time',
      target_date: '2025-12-31'
    });
    
    await testWorkerEndpoint('GET', '/api/goals');
    console.log('');
    
    // 5. Test Habits
    console.log('💪 Testing Habits Endpoints');
    await testWorkerEndpoint('GET', '/api/habits');
    
    await testWorkerEndpoint('POST', '/api/habits', {
      name: 'Morning Protein Smoothie',
      emoji: '🥤',
      difficulty: 'Easy',
      days_of_week: [1, 2, 3, 4, 5] // Monday to Friday
    });
    
    await testWorkerEndpoint('GET', '/api/habits');
    console.log('');
    
    // 6. Test Nutrition
    console.log('🥗 Testing Nutrition Endpoints');
    const today = new Date().toISOString().slice(0, 10);
    await testWorkerEndpoint('GET', `/api/nutrition?date=${today}`);
    
    await testWorkerEndpoint('POST', '/api/nutrition', {
      meal_name: 'Fresh Blendz Green Smoothie',
      meal_type: 'breakfast',
      calories: 350,
      protein: 25,
      carbs: 45,
      fat: 8,
      date: today
    });
    
    await testWorkerEndpoint('GET', `/api/nutrition?date=${today}`);
    console.log('');
    
    // 7. Test Achievements
    console.log('🏆 Testing Achievements Endpoints');
    await testWorkerEndpoint('GET', '/api/achievements');
    console.log('');
    
    // 8. Test Media (List only - we won't upload for this test)
    console.log('📸 Testing Media Endpoints');
    await testWorkerEndpoint('GET', '/api/media');
    console.log('');
    
    // 9. Test Admin endpoints (if user is admin)
    console.log('👑 Testing Admin Endpoints');
    await testWorkerEndpoint('GET', '/api/admin/users');
    console.log('');
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();