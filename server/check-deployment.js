#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Run this to verify your deployment configuration
 */

const https = require('https');
const http = require('http');

// Configuration - Update these with your actual URLs
const BACKEND_URL = process.env.RAILWAY_URL || 'https://your-railway-app.railway.app';
const FRONTEND_URL = process.env.VERCEL_URL || 'https://your-vercel-app.vercel.app';

console.log('🔍 InturnX Deployment Health Check\n');
console.log('='.repeat(50));

// Check if environment variables are set
function checkEnvVars() {
    console.log('\n📋 Checking Environment Variables...');

    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'SESSION_SECRET',
        'CLIENT_URL',
        'NODE_ENV'
    ];

    let allSet = true;
    requiredEnvVars.forEach(envVar => {
        if (process.env[envVar]) {
            console.log(`✅ ${envVar} is set`);
        } else {
            console.log(`❌ ${envVar} is NOT set`);
            allSet = false;
        }
    });

    return allSet;
}

// Check backend health
function checkBackendHealth(url) {
    return new Promise((resolve) => {
        console.log(`\n🔧 Checking Backend Health: ${url}/api/health`);

        const protocol = url.startsWith('https') ? https : http;

        protocol.get(`${url}/api/health`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'OK') {
                        console.log('✅ Backend is healthy');
                        console.log(`   Message: ${response.message}`);
                        resolve(true);
                    } else {
                        console.log('⚠️  Backend responded but status is not OK');
                        console.log(`   Response: ${data}`);
                        resolve(false);
                    }
                } catch (e) {
                    console.log('❌ Backend responded with invalid JSON');
                    console.log(`   Response: ${data}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log('❌ Backend is not accessible');
            console.log(`   Error: ${err.message}`);
            resolve(false);
        });
    });
}

// Check frontend
function checkFrontend(url) {
    return new Promise((resolve) => {
        console.log(`\n🎨 Checking Frontend: ${url}`);

        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Frontend is accessible');
                console.log(`   Status Code: ${res.statusCode}`);
                resolve(true);
            } else {
                console.log('⚠️  Frontend responded with non-200 status');
                console.log(`   Status Code: ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('❌ Frontend is not accessible');
            console.log(`   Error: ${err.message}`);
            resolve(false);
        });
    });
}

// Check CORS configuration
function checkCORS() {
    console.log('\n🔒 CORS Configuration Check');

    const clientUrl = process.env.CLIENT_URL;
    if (clientUrl) {
        console.log(`✅ CLIENT_URL is set to: ${clientUrl}`);

        if (clientUrl.includes('localhost')) {
            console.log('⚠️  Warning: CLIENT_URL points to localhost (development mode)');
        }

        if (!clientUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
            console.log('⚠️  Warning: CLIENT_URL should use HTTPS in production');
        }
    } else {
        console.log('❌ CLIENT_URL is not set');
    }
}

// Check database connection
function checkDatabase() {
    console.log('\n💾 Database Configuration Check');

    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
        console.log('✅ MONGODB_URI is set');

        if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
            console.log('⚠️  Warning: MongoDB URI points to localhost');
        }

        if (mongoUri.startsWith('mongodb+srv://')) {
            console.log('✅ Using MongoDB Atlas (cloud)');
        } else if (mongoUri.startsWith('mongodb://')) {
            console.log('ℹ️  Using MongoDB (self-hosted)');
        }
    } else {
        console.log('❌ MONGODB_URI is not set');
    }
}

// Main execution
async function main() {
    // Check environment variables
    const envVarsOk = checkEnvVars();

    // Check CORS
    checkCORS();

    // Check database
    checkDatabase();

    // Check backend health
    const backendOk = await checkBackendHealth(BACKEND_URL);

    // Check frontend
    const frontendOk = await checkFrontend(FRONTEND_URL);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   Environment Variables: ${envVarsOk ? '✅' : '❌'}`);
    console.log(`   Backend Health: ${backendOk ? '✅' : '❌'}`);
    console.log(`   Frontend Access: ${frontendOk ? '✅' : '❌'}`);

    if (envVarsOk && backendOk && frontendOk) {
        console.log('\n🎉 All checks passed! Your deployment looks good.');
    } else {
        console.log('\n⚠️  Some checks failed. Please review the issues above.');
        console.log('\nCommon fixes:');
        console.log('  1. Ensure all environment variables are set in Railway/Vercel');
        console.log('  2. Update CLIENT_URL to match your Vercel domain');
        console.log('  3. Update VITE_API_URL to match your Railway domain');
        console.log('  4. Check MongoDB Atlas network access settings');
        console.log('  5. Verify OAuth callback URLs are updated');
    }

    console.log('\n' + '='.repeat(50));
}

// Run the checks
main().catch(console.error);
