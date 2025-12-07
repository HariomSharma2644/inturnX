#!/usr/bin/env node

/**
 * InturnX Deployment Diagnostic Tool
 * Checks the current state of your Railway deployment
 */

const https = require('https');

const RAILWAY_URL = 'https://inturnx-production.up.railway.app';

console.log('🔍 InturnX Deployment Diagnostic\n');
console.log('='.repeat(60));
console.log(`\nChecking deployment at: ${RAILWAY_URL}\n`);

// Test backend health
function testBackendHealth() {
    return new Promise((resolve) => {
        console.log('1️⃣  Testing Backend Health...');

        https.get(`${RAILWAY_URL}/api/health`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'OK') {
                        console.log('   ✅ Backend is healthy');
                        console.log(`   📝 Message: ${response.message}`);
                        resolve({ success: true, data: response });
                    } else {
                        console.log('   ⚠️  Backend responded but status is not OK');
                        console.log(`   📝 Response: ${data}`);
                        resolve({ success: false, data: response });
                    }
                } catch (e) {
                    console.log('   ❌ Backend responded with invalid JSON');
                    console.log(`   📝 Response: ${data}`);
                    resolve({ success: false, error: e.message });
                }
            });
        }).on('error', (err) => {
            console.log('   ❌ Backend is not accessible');
            console.log(`   📝 Error: ${err.message}`);
            resolve({ success: false, error: err.message });
        });
    });
}

// Test frontend
function testFrontend() {
    return new Promise((resolve) => {
        console.log('\n2️⃣  Testing Frontend...');

        https.get(RAILWAY_URL, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('   ✅ Frontend is accessible');
                    console.log(`   📝 Status Code: ${res.statusCode}`);

                    // Check if it's the React app
                    if (data.includes('id="root"')) {
                        console.log('   ✅ React app detected (found root div)');
                    } else {
                        console.log('   ⚠️  HTML loaded but root div not found');
                    }

                    // Check for Vite build assets
                    if (data.includes('/assets/')) {
                        console.log('   ✅ Vite build assets detected');
                    } else {
                        console.log('   ⚠️  Vite build assets not found');
                    }

                    resolve({ success: true, statusCode: res.statusCode });
                } else {
                    console.log('   ⚠️  Frontend responded with non-200 status');
                    console.log(`   📝 Status Code: ${res.statusCode}`);
                    resolve({ success: false, statusCode: res.statusCode });
                }
            });
        }).on('error', (err) => {
            console.log('   ❌ Frontend is not accessible');
            console.log(`   📝 Error: ${err.message}`);
            resolve({ success: false, error: err.message });
        });
    });
}

// Test API endpoint
function testAPIEndpoint() {
    return new Promise((resolve) => {
        console.log('\n3️⃣  Testing API Endpoints...');

        https.get(`${RAILWAY_URL}/api/courses`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 401) {
                    console.log('   ✅ API endpoint is responding');
                    console.log(`   📝 Status Code: ${res.statusCode}`);

                    if (res.statusCode === 401) {
                        console.log('   ℹ️  Endpoint requires authentication (expected)');
                    }

                    resolve({ success: true, statusCode: res.statusCode });
                } else {
                    console.log('   ⚠️  API endpoint responded with unexpected status');
                    console.log(`   📝 Status Code: ${res.statusCode}`);
                    resolve({ success: false, statusCode: res.statusCode });
                }
            });
        }).on('error', (err) => {
            console.log('   ❌ API endpoint is not accessible');
            console.log(`   📝 Error: ${err.message}`);
            resolve({ success: false, error: err.message });
        });
    });
}

// Check HTTPS
function checkHTTPS() {
    console.log('\n4️⃣  Checking HTTPS...');

    if (RAILWAY_URL.startsWith('https://')) {
        console.log('   ✅ Using HTTPS (secure)');
        return true;
    } else {
        console.log('   ⚠️  Not using HTTPS');
        return false;
    }
}

// Main execution
async function main() {
    const backendResult = await testBackendHealth();
    const frontendResult = await testFrontend();
    const apiResult = await testAPIEndpoint();
    const httpsOk = checkHTTPS();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Deployment Status Summary:\n');

    console.log(`   Backend Health:     ${backendResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Frontend Access:    ${frontendResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   API Endpoints:      ${apiResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   HTTPS:              ${httpsOk ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n' + '='.repeat(60));

    if (backendResult.success && frontendResult.success && apiResult.success) {
        console.log('\n🎉 SUCCESS! Your deployment is working correctly!\n');
        console.log('✅ Backend is running');
        console.log('✅ Frontend is accessible');
        console.log('✅ API endpoints are responding');
        console.log('\n📱 You can access your app at:');
        console.log(`   ${RAILWAY_URL}\n`);
        console.log('🔐 Try logging in with:');
        console.log('   Email: demo@inturnx.com');
        console.log('   Password: demo123\n');
    } else {
        console.log('\n⚠️  Some issues detected. Please check the details above.\n');

        if (!backendResult.success) {
            console.log('❌ Backend Issue:');
            console.log('   - Check Railway logs for errors');
            console.log('   - Verify environment variables are set');
            console.log('   - Check MongoDB connection\n');
        }

        if (!frontendResult.success) {
            console.log('❌ Frontend Issue:');
            console.log('   - Verify client build was successful');
            console.log('   - Check that client/dist exists');
            console.log('   - Review Railway build logs\n');
        }

        if (!apiResult.success) {
            console.log('❌ API Issue:');
            console.log('   - Check server routes are configured');
            console.log('   - Verify middleware is set up correctly');
            console.log('   - Review Railway deployment logs\n');
        }
    }

    console.log('='.repeat(60));
    console.log('\n📚 For more help, check:');
    console.log('   - RAILWAY_ONLY_DEPLOYMENT.md');
    console.log('   - TROUBLESHOOTING.md');
    console.log('   - Railway deployment logs\n');
}

// Run the diagnostic
main().catch(console.error);
