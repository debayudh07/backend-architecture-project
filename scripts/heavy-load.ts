
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 50;

async function runHeavyLoad() {
    console.log(`--- STARTING HEAVY LOAD TEST (${CONCURRENT_REQUESTS} requests) ---`);

    const promises: Promise<any>[] = [];

    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        const email = `loadtest${Date.now()}_${i}@example.com`;
        const password = 'password123';

        // Fire and forget - don't await individual requests
        const promise = axios.post(`${BASE_URL}/users/signup`, {
            email,
            password,
            name: `Load Test User ${i}`,
        }).then(() => {
            console.log(`✅ Request ${i} sent`);
        }).catch((err) => {
            console.error(`❌ Request ${i} failed:`, err.message);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
    console.log('--- ALL REQUESTS SENT ---');
    console.log('Check the application logs to see Worker processing them one by one.');
}

runHeavyLoad();
