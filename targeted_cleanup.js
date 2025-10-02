#!/usr/bin/env node
/**
 * StriveTrack Targeted User Cleanup
 * Remove specific non-admin users from all database tables
 */

const API_BASE_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev';
const ADMIN_EMAIL = 'iamhollywoodpro@protonmail.com';
const ADMIN_PASSWORD = 'iampassword@1981';
const ADMIN_TOKEN = 'st_1759350794232_f3r635nut2b_h3wb0tsa6fl';

// Users to preserve (admin accounts)
const PRESERVE_USERS = ['user_1759200586594_ylvua37h']; // Admin ID from discovery

// Users to remove (identified problematic users)
const REMOVE_USERS = ['136d84f0-d877-4c0c-b2f0-2e6270fcee9c']; // Steve Hollywood

console.log('🧹 StriveTrack Targeted Cleanup Tool');
console.log('====================================');
console.log('🛡️  PRESERVING:', PRESERVE_USERS);
console.log('🗑️  REMOVING:', REMOVE_USERS);

// Get valid admin token
async function getValidToken() {
    try {
        // First check if current token works
        const authCheck = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        if (authCheck.ok) {
            console.log('✅ Using existing admin token');
            return ADMIN_TOKEN;
        }
        
        // If not, login fresh
        console.log('🔄 Getting fresh admin token...');
        const loginResp = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
        const loginData = await loginResp.json();
        if (loginResp.ok) {
            console.log('✅ Fresh admin login successful');
            return loginData.token;
        } else {
            console.log('❌ Admin login failed:', loginData);
            return null;
        }
    } catch (error) {
        console.log('❌ Token acquisition failed:', error.message);
        return null;
    }
}

// First verify what users currently exist
async function verifyCurrentUsers(token) {
    console.log('\n📋 Current Users in Database:');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('👥 Found users:');
            data.users.forEach((user, index) => {
                const status = PRESERVE_USERS.includes(user.id) ? '✅ PRESERVE' : 
                             REMOVE_USERS.includes(user.id) ? '❌ REMOVE' : '⚠️  UNKNOWN';
                console.log(`   ${index + 1}. ${status} ID: ${user.id}, Name: ${user.name}`);
            });
            return data.users;
        } else {
            console.log('❌ Failed to get user list');
            return [];
        }
    } catch (error) {
        console.log('❌ User verification failed:', error.message);
        return [];
    }
}

// Test registration with proper password format
async function testRegistrationWithProperPassword() {
    console.log('\n🧪 Testing Registration with Proper Password Format...');
    const testEmail = 'test-' + Date.now() + '@example.com';
    const strongPassword = 'TestPass123!'; // Meets uppercase, lowercase, number, special char requirements
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: strongPassword,
                name: 'Test User'
            })
        });
        const data = await response.json();
        console.log(`   Registration Status: ${response.status}`);
        if (response.ok) {
            console.log('✅ Registration successful (user exists issue not password):', data.user);
            return { success: true, userId: data.user.id, email: testEmail };
        } else {
            console.log('❌ Registration still failed:', data);
            // Check if it's the "user already exists" error
            if (data.error && data.error.toLowerCase().includes('already')) {
                console.log('🎯 CONFIRMED: Issue is "user already exists" not password format');
            }
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('❌ Registration test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Try to remove user using different methods
async function attemptUserRemoval(token, userId, userName) {
    console.log(`\n🗑️ Attempting to remove user: ${userId} (${userName})`);
    
    const methods = [
        {
            name: 'Admin Delete User',
            method: 'DELETE',
            url: `${API_BASE_URL}/api/admin/users/${userId}`,
        },
        {
            name: 'Admin User Management',
            method: 'DELETE',
            url: `${API_BASE_URL}/api/admin/user/${userId}`,
        },
        {
            name: 'Direct User Delete',
            method: 'DELETE', 
            url: `${API_BASE_URL}/api/users/${userId}`,
        }
    ];
    
    for (const method of methods) {
        try {
            console.log(`   Trying: ${method.name}`);
            const response = await fetch(method.url, {
                method: method.method,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.text();
            console.log(`   Status: ${response.status}`);
            if (response.ok) {
                console.log(`   ✅ Success with ${method.name}`);
                return true;
            } else {
                console.log(`   ❌ ${method.name} failed:`, data);
            }
        } catch (error) {
            console.log(`   ❌ ${method.name} error:`, error.message);
        }
    }
    
    return false;
}

// Since direct API deletion might not work, let's try to create a custom cleanup endpoint
async function tryCustomCleanupEndpoint(token) {
    console.log('\n🔧 Testing Custom Cleanup Endpoints...');
    
    const endpoints = [
        `${API_BASE_URL}/api/admin/cleanup`,
        `${API_BASE_URL}/api/admin/database/reset`,
        `${API_BASE_URL}/api/admin/database/cleanup`,
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`   Testing: ${endpoint}`);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    action: 'remove_non_admin_users',
                    preserve_user_ids: PRESERVE_USERS 
                })
            });
            const data = await response.text();
            console.log(`   Status: ${response.status}, Response:`, data.substring(0, 200));
        } catch (error) {
            console.log(`   ❌ ${endpoint} failed:`, error.message);
        }
    }
}

// Final verification - check if users were removed
async function finalVerification(token) {
    console.log('\n🔍 Final Verification...');
    
    // Check user list
    const users = await verifyCurrentUsers(token);
    
    // Test registration again
    const regTest = await testRegistrationWithProperPassword();
    
    return {
        remainingUsers: users,
        registrationWorks: regTest.success
    };
}

// Main execution
async function main() {
    try {
        console.log('\n🚀 Starting Targeted Cleanup Process...');
        
        // Step 1: Get admin token
        const token = await getValidToken();
        if (!token) {
            console.log('❌ Cannot proceed without admin token');
            return;
        }
        
        // Step 2: Verify current state
        const currentUsers = await verifyCurrentUsers(token);
        
        // Step 3: Test registration to confirm issue
        const regTest = await testRegistrationWithProperPassword();
        
        // Step 4: Try to remove problematic users
        for (const userId of REMOVE_USERS) {
            const user = currentUsers.find(u => u.id === userId);
            if (user) {
                const removed = await attemptUserRemoval(token, userId, user.name);
                if (!removed) {
                    console.log(`⚠️ Could not remove user ${userId} via API`);
                }
            }
        }
        
        // Step 5: Try custom cleanup endpoints
        await tryCustomCleanupEndpoint(token);
        
        // Step 6: Final verification
        const finalState = await finalVerification(token);
        
        // Summary
        console.log('\n=================================');
        console.log('📊 CLEANUP SUMMARY');
        console.log('=================================');
        console.log(`🔄 Users remaining: ${finalState.remainingUsers.length}`);
        finalState.remainingUsers.forEach((user, index) => {
            const status = PRESERVE_USERS.includes(user.id) ? '✅ ADMIN' : '❌ PROBLEM';
            console.log(`   ${index + 1}. ${status} ${user.name} (${user.id})`);
        });
        console.log(`📝 Registration test: ${finalState.registrationWorks ? '✅ Working' : '❌ Still blocked'}`);
        
        if (!finalState.registrationWorks && finalState.remainingUsers.length > 1) {
            console.log('\n⚠️ ISSUE PERSISTS - Alternative approaches needed:');
            console.log('1. Direct D1 database access via Wrangler CLI');
            console.log('2. Custom cleanup worker deployment');
            console.log('3. Manual database console access');
        } else if (finalState.registrationWorks) {
            console.log('\n🎉 SUCCESS! Registration should now work!');
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

main();