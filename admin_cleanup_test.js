#!/usr/bin/env node
/**
 * StriveTrack Admin Cleanup Tool
 * Test and identify working admin endpoints, then cleanup users
 */

const API_BASE_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev';
const ADMIN_EMAIL = 'iamhollywoodpro@protonmail.com';
const ADMIN_PASSWORD = 'iampassword@1981';
const ADMIN_TOKEN = 'st_1759350794232_f3r635nut2b_h3wb0tsa6fl'; // From handover doc

console.log('🔧 StriveTrack Admin Cleanup Tool');
console.log('=====================================');

// Test different methods to get user list and cleanup
async function testEndpoints() {
    console.log('\n1. Testing API Health...');
    try {
        const health = await fetch(`${API_BASE_URL}/api/health`);
        const healthData = await health.json();
        console.log('✅ API Health:', healthData);
    } catch (error) {
        console.log('❌ API Health failed:', error.message);
        return;
    }

    console.log('\n2. Testing Admin Token Validity...');
    try {
        const authCheck = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        const authData = await authCheck.json();
        if (authCheck.ok) {
            console.log('✅ Admin token valid:', authData);
        } else {
            console.log('❌ Admin token invalid, attempting login...');
            const loginResp = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            });
            const loginData = await loginResp.json();
            if (loginResp.ok) {
                console.log('✅ Admin login successful:', loginData);
                const newToken = loginData.token;
                console.log('🆕 New admin token:', newToken);
                return newToken;
            } else {
                console.log('❌ Admin login failed:', loginData);
                return null;
            }
        }
        return ADMIN_TOKEN;
    } catch (error) {
        console.log('❌ Auth check failed:', error.message);
        return null;
    }
}

// Test user discovery methods
async function discoverUsers(token) {
    console.log('\n3. Testing User Discovery Methods...');
    
    const methods = [
        { name: 'Admin Users Endpoint', url: `${API_BASE_URL}/api/admin/users` },
        { name: 'User Profiles', url: `${API_BASE_URL}/api/profile` },
    ];
    
    for (const method of methods) {
        try {
            console.log(`\n   Testing: ${method.name}`);
            const response = await fetch(method.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log(`   Status: ${response.status}`);
            if (response.ok) {
                console.log('   ✅ Success:', JSON.stringify(data, null, 2));
            } else {
                console.log('   ❌ Error:', data);
            }
        } catch (error) {
            console.log(`   ❌ ${method.name} failed:`, error.message);
        }
    }
}

// Direct database query through system-test endpoint
async function testSystemEndpoint() {
    console.log('\n4. Testing System Test Endpoint (No Auth)...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/system-test`);
        const data = await response.json();
        console.log('✅ System Test Results:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ System test failed:', error.message);
    }
}

// Test if we can perform a test registration to see the error
async function testRegistration() {
    console.log('\n5. Testing Registration to Reproduce Error...');
    const testEmail = 'test-cleanup-' + Date.now() + '@example.com';
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'testpass123',
                name: 'Test User'
            })
        });
        const data = await response.json();
        console.log(`   Registration Status: ${response.status}`);
        if (response.ok) {
            console.log('✅ Registration successful:', data);
            return data.user?.id;
        } else {
            console.log('❌ Registration failed:', data);
            return null;
        }
    } catch (error) {
        console.log('❌ Registration test failed:', error.message);
        return null;
    }
}

// Try to count users using alternative methods  
async function alternativeUserCount(token) {
    console.log('\n6. Alternative User Count Methods...');
    
    // Try to get user list through profiles endpoint
    try {
        console.log('   Testing user profiles query...');
        // This won't work directly, but let's see what happens
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Found users via admin endpoint:', data);
            return data;
        } else {
            console.log('❌ Admin users endpoint not accessible');
        }
    } catch (error) {
        console.log('❌ Alternative count failed:', error.message);
    }
    
    return null;
}

// Main execution
async function main() {
    try {
        // Test basic connectivity and get valid token
        const token = await testEndpoints();
        if (!token) {
            console.log('\n❌ Cannot proceed without valid admin token');
            return;
        }
        
        // Test system endpoint
        await testSystemEndpoint();
        
        // Try to discover existing users
        await discoverUsers(token);
        
        // Test registration to see the actual error
        const testUserId = await testRegistration();
        
        // Try alternative methods to count users
        const userData = await alternativeUserCount(token);
        
        console.log('\n=================================');
        console.log('🎯 SUMMARY');
        console.log('=================================');
        console.log('- API is accessible and healthy');
        console.log('- Admin authentication:', token ? '✅ Working' : '❌ Failed');
        console.log('- User discovery methods tested');
        console.log('- Registration test completed');
        
        if (userData && userData.users) {
            console.log(`- Found ${userData.users.length} users in database`);
            userData.users.forEach((user, index) => {
                console.log(`  ${index + 1}. ID: ${user.id}, Name: ${user.name}`);
            });
        }
        
        if (token) {
            console.log('\n🔨 Next Steps:');
            console.log('1. Review user discovery results above');
            console.log('2. Identify non-admin users to remove');
            console.log('3. Use appropriate cleanup method');
            console.log('4. Verify registration works after cleanup');
            console.log('\n⚠️  CRITICAL: Preserve admin account:', ADMIN_EMAIL);
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

main();