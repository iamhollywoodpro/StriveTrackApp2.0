// Comprehensive test for Hollywood's account
const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c';
const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

async function testHollywoodAccount() {
  console.log('🎵 Testing Hollywood\'s StriveTrack account...\n');
  
  try {
    // Login with Hollywood's credentials
    console.log('🔑 Logging in as iamhollywoodpro@gmail.com...');
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
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const authData = await loginResponse.json();
    const token = authData.access_token;
    const user = authData.user;
    
    console.log('✅ Login successful!');
    console.log(`👤 User ID: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🕐 Created: ${new Date(user.created_at).toLocaleDateString()}\n`);

    // Test all the endpoints
    console.log('🧪 Testing all API endpoints...\n');

    // 1. Test Profile
    console.log('1️⃣ Testing Profile...');
    const profileResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ Profile loaded:', JSON.stringify(profile, null, 2));
    } else {
      console.log('❌ Profile failed:', profileResponse.status, await profileResponse.text());
    }

    // 2. Test Achievements
    console.log('\n2️⃣ Testing Achievements...');
    const achievementsResponse = await fetch(`${API_BASE}/achievements`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (achievementsResponse.ok) {
      const achievements = await achievementsResponse.json();
      console.log(`✅ Achievements loaded: ${achievements.total_points} total points`);
      console.log(`📊 Items count: ${achievements.items?.length || 0}`);
      if (achievements.items?.length > 0) {
        achievements.items.forEach(item => {
          console.log(`  - ${item.code}: ${item.points} points`);
        });
      }
    } else {
      console.log('❌ Achievements failed:', achievementsResponse.status);
    }

    // 3. Test Goals
    console.log('\n3️⃣ Testing Goals...');
    const goalsResponse = await fetch(`${API_BASE}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (goalsResponse.ok) {
      const goals = await goalsResponse.json();
      console.log(`✅ Goals loaded: ${goals.items?.length || 0} goals`);
      if (goals.items?.length > 0) {
        goals.items.forEach(goal => {
          console.log(`  - ${goal.title} (target: ${goal.target_date})`);
        });
      }
    } else {
      console.log('❌ Goals failed:', goalsResponse.status);
    }

    // 4. Test Habits
    console.log('\n4️⃣ Testing Habits...');
    const habitsResponse = await fetch(`${API_BASE}/habits`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (habitsResponse.ok) {
      const habits = await habitsResponse.json();
      console.log(`✅ Habits loaded: ${habits.items?.length || 0} habits`);
      if (habits.items?.length > 0) {
        habits.items.forEach(habit => {
          console.log(`  - ${habit.name} ${habit.emoji} (${habit.difficulty})`);
        });
      }
    } else {
      console.log('❌ Habits failed:', habitsResponse.status);
    }

    // 5. Test Nutrition
    console.log('\n5️⃣ Testing Nutrition...');
    const today = new Date().toISOString().split('T')[0];
    const nutritionResponse = await fetch(`${API_BASE}/nutrition?date=${today}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (nutritionResponse.ok) {
      const nutrition = await nutritionResponse.json();
      console.log(`✅ Nutrition loaded for ${today}: ${nutrition.items?.length || 0} entries`);
      if (nutrition.items?.length > 0) {
        nutrition.items.forEach(item => {
          console.log(`  - ${item.meal_name} (${item.calories} cal)`);
        });
      }
    } else {
      console.log('❌ Nutrition failed:', nutritionResponse.status);
    }

    // 6. Test Media
    console.log('\n6️⃣ Testing Media...');
    const mediaResponse = await fetch(`${API_BASE}/media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (mediaResponse.ok) {
      const media = await mediaResponse.json();
      console.log(`✅ Media loaded: ${media.items?.length || 0} files`);
      if (media.items?.length > 0) {
        media.items.forEach(item => {
          console.log(`  - ${item.key} (${item.contentType})`);
          console.log(`    URL: ${item.url?.substring(0, 100)}...`);
        });
      }
    } else {
      console.log('❌ Media failed:', mediaResponse.status);
    }

    // Test creating a goal
    console.log('\n7️⃣ Testing Goal Creation...');
    const createGoalResponse = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Goal from Hollywood',
        description: 'This is a test goal to verify creation works',
        target_date: '2024-12-31'
      })
    });
    
    if (createGoalResponse.ok) {
      const result = await createGoalResponse.json();
      console.log('✅ Goal created successfully:', result);
    } else {
      console.log('❌ Goal creation failed:', createGoalResponse.status, await createGoalResponse.text());
    }

    // Test creating nutrition
    console.log('\n8️⃣ Testing Nutrition Creation...');
    const createNutritionResponse = await fetch(`${API_BASE}/nutrition`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meal_name: 'Test Meal from Hollywood',
        meal_type: 'lunch',
        calories: 500,
        protein: 30,
        carbs: 60,
        fat: 15,
        date: today
      })
    });
    
    if (createNutritionResponse.ok) {
      const result = await createNutritionResponse.json();
      console.log('✅ Nutrition entry created successfully:', result);
    } else {
      console.log('❌ Nutrition creation failed:', createNutritionResponse.status, await createNutritionResponse.text());
    }

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testHollywoodAccount();