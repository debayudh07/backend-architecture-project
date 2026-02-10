
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    let accessToken = '';
    let refreshToken = '';
    let userId = '';

    console.log('--- STARTING AUTH TESTS ---');

    // 1. Signup
    try {
        console.log('1. Testing Signup...');
        const response = await axios.post(`${BASE_URL}/users/signup`, {
            email,
            password,
            name: 'Test User',
        });
        console.log('✅ Signup successful');
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        // Decode token to get userId (simple decode, not verify)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        userId = payload.sub;
        console.log(`   User ID: ${userId}`);
    } catch (error: any) {
        console.error('❌ Signup failed:', error.response?.data || error.message);
        process.exit(1);
    }

    // 2. Login
    try {
        console.log('\n2. Testing Login...');
        const response = await axios.post(`${BASE_URL}/users/login`, {
            email,
            password,
        });
        console.log('✅ Login successful');
        // Update tokens
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
    } catch (error: any) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }

    // 3. Get Profile (Protected)
    try {
        console.log('\n3. Testing Get Profile (Protected)...');
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('✅ Get Profile successful');
        console.log('   Profile Email:', response.data.email);
    } catch (error: any) {
        console.error('❌ Get Profile failed:', error.response?.data || error.message);
    }

    // 4. Refresh Token
    try {
        console.log('\n4. Testing Refresh Token...');
        const response = await axios.post(
            `${BASE_URL}/users/refresh`,
            {},
            {
                headers: { Authorization: `Bearer ${refreshToken}` },
            },
        );
        console.log('✅ Refresh Token successful');
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
    } catch (error: any) {
        console.error('❌ Refresh Token failed:', error.response?.data || error.message);
    }

    // 5. Logout
    try {
        console.log('\n5. Testing Logout...');
        await axios.post(
            `${BASE_URL}/users/logout`,
            {},
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );
        console.log('✅ Logout successful');
    } catch (error: any) {
        console.error('❌ Logout failed:', error.response?.data || error.message);
    }

    // 6. Verify Refresh Token Invalidated
    try {
        console.log('\n6. Testing Refresh Token after Logout (Should Fail)...');
        await axios.post(
            `${BASE_URL}/users/refresh`,
            {},
            {
                headers: { Authorization: `Bearer ${refreshToken}` },
            },
        );
        console.error('❌ Refresh Token succeeded but should have failed');
    } catch (error: any) {
        if (error.response?.status === 403 || error.response?.status === 401) {
            console.log('✅ Refresh Token correctly failed with 403/401');
        } else {
            console.error('❌ Refresh Token failed with unexpected error:', error.response?.status);
        }
    }

    console.log('\n--- TESTS COMPLETED ---');
}

runTests();
