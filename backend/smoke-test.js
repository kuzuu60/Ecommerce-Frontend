const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

const log = (msg) => console.log(`[SmokeTest] ${msg}`);
const errLog = (msg) => console.error(`[SmokeTest ERROR] ${msg}`);

const endpoints = [
    { name: 'Get Products', method: 'GET', path: '/products', expectedStatus: 200 },
    { name: 'Get Product 1', method: 'GET', path: '/products/1', expectedStatus: [200, 404] }, // Might not exist
    { name: 'Register (No Body)', method: 'POST', path: '/auth/register', expectedStatus: 400 }, // Should fail due to missing body
    { name: 'Login (No Body)', method: 'POST', path: '/auth/login', expectedStatus: 400 },
    { name: 'Get Orders (Unauthorized)', method: 'GET', path: '/orders', expectedStatus: 401 },
    { name: 'Create Order (Unauthorized)', method: 'POST', path: '/orders', expectedStatus: 401 },
    { name: 'Get Admin Users (Unauthorized)', method: 'GET', path: '/admin/users', expectedStatus: 401 }
];

async function runTest(endpoint) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: `/api${endpoint.path}`,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            const status = res.statusCode;
            let success = Array.isArray(endpoint.expectedStatus) 
                ? endpoint.expectedStatus.includes(status) 
                : status === endpoint.expectedStatus;

            // Check for security headers
            const hasHelmet = !!res.headers['x-powered-by'] === false && !!res.headers['content-security-policy'];
            
            if (success) {
                log(`✅ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - Status: ${status}`);
                if (!hasHelmet) log(`⚠️ ${endpoint.name} missing expected security headers (Helmet)`);
            } else {
                errLog(`❌ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - Expected: ${endpoint.expectedStatus}, Got: ${status}`);
            }

            res.on('data', () => {}); // Consume data
            res.on('end', () => resolve(success));
        });

        req.on('error', (e) => {
            errLog(`❌ ${endpoint.name} - Request Error: ${e.message}`);
            resolve(false);
        });

        if (endpoint.method === 'POST') {
            req.write(JSON.stringify({}));
        }
        
        req.end();
    });
}

async function runAllTests() {
    log(`Starting comprehensive smoke test on http://localhost:${PORT}...`);
    let passed = 0;
    
    // Test basic endpoints
    for (const ep of endpoints) {
        const result = await runTest(ep);
        if (result) passed++;
    }

    // Test rate limiting on Auth
    log('Testing Auth Rate Limiter...');
    let rateLimitHit = false;
    for (let i = 0; i < 25; i++) {
        const result = await new Promise((resolve) => {
            http.request({
                hostname: 'localhost',
                port: PORT,
                path: '/api/auth/login',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                if (res.statusCode === 429) rateLimitHit = true;
                res.on('data', () => {});
                res.on('end', () => resolve());
            }).end(JSON.stringify({}));
        });
    }

    if (rateLimitHit) {
        log('✅ Rate limiter successfully blocked rapid auth requests (429 Too Many Requests)');
    } else {
        errLog('❌ Rate limiter failed or is not configured properly.');
    }

    log('=============================================');
    log(`Smoke Test Results: ${passed}/${endpoints.length} Basic Tests Passed.`);
    if (passed === endpoints.length && rateLimitHit) {
        log('🎉 All systems GO. Security and integrity checks passed.');
    } else {
        errLog('⚠️ Some tests failed. Please review logs above.');
    }
}

// Allow a bit of time for server to fully initialize
setTimeout(runAllTests, 1500);
