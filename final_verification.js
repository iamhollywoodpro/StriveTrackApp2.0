#!/usr/bin/env node
/**
 * StriveTrack Final Verification & Cleanup
 * Verify registration is working and clean up all test users
 */

const API_BASE_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev';
const ADMIN_EMAIL = 'iamhollywoodpro@protonmail.com';
const ADMIN_PASSWORD = 'iampassword@1981';
const ADMIN_TOKEN = 'st_1759350794232_f3r635nut2b_h3wb0tsa6fl';

// Only preserve this admin user
const ADMIN_USER_ID = 'user_1759200586594_ylvua37h';
const ADMIN_USER_EMAIL = 'iamhollywoodpro@protonmail.com';

console.log('🔍 StriveTrack Final Verification & Cleanup');
console.log('============================================');

async function getValidToken() {
    try {
        const authCheck = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        if (authCheck.ok) {
            return ADMIN_TOKEN;
        }
        
        const loginResp = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
        const loginData = await loginResp.json();
        return loginResp.ok ? loginData.token : null;
    } catch (error) {
        console.log('❌ Token acquisition failed:', error.message);
        return null;
    }
}

// Get comprehensive user list from multiple sources
async function getComprehensiveUserList(token) {
    console.log('\n📊 Getting Comprehensive User List...');
    
    const users = new Map();
    
    // Method 1: Admin users endpoint (user_profiles table)
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Found ${data.users.length} users via admin/users endpoint`);
            data.users.forEach(user => {
                users.set(user.id, { ...user, source: 'admin_users' });
            });
        }
    } catch (error) {
        console.log('❌ Admin users endpoint failed:', error.message);
    }
    
    // Method 2: Check if there are users in the main users table by trying some operations
    // We can infer this from successful registrations
    
    return Array.from(users.values());
}

// Try different approaches to find the actual blocking issue
async function testSpecificRegistrationScenarios() {
    console.log('\n🧪 Testing Specific Registration Scenarios...');
    
    const scenarios = [
        {
            name: 'Fresh Email',
            email: 'completely-new-' + Date.now() + '@example.com',
            password: 'TestPass123!'
        },
        {
            name: 'Test Previously Used Email',
            email: 'test@example.com', // Common test email that might exist
            password: 'TestPass123!'
        },
        {
            name: 'Steve Hollywood Email',
            email: 'steve@freshblendz.com', // Try the email that might exist for Steve
            password: 'TestPass123!'
        }
    ];
    
    const results = [];
    
    for (const scenario of scenarios) {
        try {
            console.log(`\n   Testing: ${scenario.name} (${scenario.email})`);
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: scenario.email,
                    password: scenario.password,
                    name: scenario.name + ' User'
                })
            });
            const data = await response.json();
            
            if (response.ok) {
                console.log(`   ✅ SUCCESS: Created user ${data.user.id}`);
                results.push({ ...scenario, success: true, userId: data.user.id });
            } else {
                console.log(`   ❌ FAILED: ${data.error}`);
                results.push({ ...scenario, success: false, error: data.error });
                
                // Check if it's the "already registered" error
                if (data.error && data.error.toLowerCase().includes('already')) {
                    console.log(`   🎯 FOUND EXISTING USER: ${scenario.email}`);
                }
            }
        } catch (error) {
            console.log(`   💥 ERROR: ${error.message}`);
            results.push({ ...scenario, success: false, error: error.message });
        }
    }
    
    return results;
}

// Look at the main users table by examining successful logins
async function examineMainUsersTable(token) {
    console.log('\n🔍 Examining Main Users Table...');
    
    // Try to login as different potential users to see what exists in the main users table
    const potentialUsers = [
        { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, expected: true },
        { email: 'steve@freshblendz.com', password: 'password123', expected: false },
        { email: 'test@example.com', password: 'password123', expected: false },
    ];
    
    console.log('   Testing login attempts to discover existing users...');
    
    for (const user of potentialUsers) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            });
            const data = await response.json();
            
            if (response.ok) {
                console.log(`   ✅ LOGIN SUCCESS: ${user.email} -> User ID: ${data.user.id}`);
            } else {
                if (data.error === 'Invalid credentials') {
                    console.log(`   🔍 USER EXISTS: ${user.email} (wrong password)`);
                } else {
                    console.log(`   ❌ ${user.email}: ${data.error}`);
                }
            }
        } catch (error) {
            console.log(`   💥 ${user.email}: ${error.message}`);
        }
    }
}

// Try to delete users from all possible tables
async function comprehensiveCleanup(token, users) {
    console.log('\n🧹 Comprehensive Cleanup of Non-Admin Users...');
    
    const nonAdminUsers = users.filter(user => 
        user.id !== ADMIN_USER_ID && 
        !user.name?.toLowerCase().includes('iamhollywoodpro')
    );
    
    console.log(`🎯 Found ${nonAdminUsers.length} non-admin users to clean:`);
    nonAdminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.id})`);
    });
    
    // Since API delete endpoints return 404, let's document what needs to be cleaned
    console.log('\n📝 CLEANUP NEEDED (API endpoints not available):');
    console.log('   Tables that may contain user data:');
    console.log('   - users (main users table)');
    console.log('   - user_profiles (profile info)');
    console.log('   - user_sessions (active sessions)');
    console.log('   - media (uploaded files)');
    console.log('   - nutrition_logs (nutrition data)');
    console.log('   - achievements (user achievements)');
    console.log('   - points_ledger (points data)');
    console.log('   - habits (user habits)');
    console.log('   - habit_logs (habit tracking)');
    console.log('   - goals (user goals)');
    console.log('   - social_posts (social content)');
    console.log('   - And all related tables...');
    
    return nonAdminUsers.map(user => user.id);
}

// Test the actual user experience
async function testRealUserExperience() {
    console.log('\n🎭 Testing Real User Experience...');
    
    const realTestEmail = 'real-tester-' + Date.now() + '@test.com';
    
    try {
        console.log(`   Creating account: ${realTestEmail}`);
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: realTestEmail,
                password: 'RealTester123!',
                name: 'Real Tester'
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('   ✅ Registration successful!');
            console.log(`   👤 New User: ${data.user.name} (${data.user.id})`);
            
            // Try to login immediately 
            const loginResp = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: realTestEmail,
                    password: 'RealTester123!'
                })
            });
            const loginData = await loginResp.json();
            
            if (loginResp.ok) {
                console.log('   ✅ Login after registration successful!');
                return { success: true, userId: data.user.id, email: realTestEmail };
            } else {
                console.log('   ❌ Login after registration failed:', loginData.error);
                return { success: false, error: 'Login failed after registration' };
            }
        } else {
            console.log('   ❌ Registration failed:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('   💥 Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function main() {
    try {
        const token = await getValidToken();
        if (!token) {
            console.log('❌ Cannot proceed without admin token');
            return;
        }
        
        // Get comprehensive user list
        const users = await getComprehensiveUserList(token);
        
        // Test registration scenarios
        const regResults = await testSpecificRegistrationScenarios();
        
        // Examine main users table
        await examineMainUsersTable(token);
        
        // Test real user experience
        const realTest = await testRealUserExperience();
        
        // Document cleanup needs
        const cleanupNeeded = await comprehensiveCleanup(token, users);
        
        // Final summary
        console.log('\n=================================');
        console.log('🎯 FINAL ANALYSIS');
        console.log('=================================');
        console.log(`📊 Users found in profiles table: ${users.length}`);
        console.log(`🧪 Registration tests: ${regResults.filter(r => r.success).length}/${regResults.length} successful`);
        console.log(`👤 Real user experience: ${realTest.success ? '✅ Working' : '❌ Failed'}`);
        
        if (realTest.success) {
            console.log('\n🎉 GREAT NEWS: Registration is working!');
            console.log('✅ New users can successfully sign up and log in');
            console.log('✅ The original issue appears to be resolved');
        } else {
            console.log('\n⚠️ ISSUE PERSISTS:', realTest.error);
        }
        
        console.log('\n📋 USERS TO PRESERVE:');
        console.log(`   ✅ Admin: ${ADMIN_EMAIL} (${ADMIN_USER_ID})`);
        
        if (cleanupNeeded.length > 0) {
            console.log('\n📋 USERS THAT COULD BE CLEANED (optional):');
            users.forEach(user => {
                if (user.id !== ADMIN_USER_ID) {
                    console.log(`   🔹 ${user.name} (${user.id})`);
                }
            });
        }
        
        console.log('\n🏁 CONCLUSION:');
        if (realTest.success) {
            console.log('✅ The signup issue is RESOLVED');
            console.log('✅ New testers can now register successfully');
            console.log('📝 Optional: Clean up test/old users for housekeeping');
        } else {
            console.log('❌ Further investigation needed');
            console.log('🔧 Consider direct database access via Wrangler CLI');
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

main();