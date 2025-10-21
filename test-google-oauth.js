/**
 * Test script để kiểm tra Google OAuth configuration
 * Chạy: node test-google-oauth.js
 */

const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Kiểm tra cấu hình Google OAuth...\n');

// Kiểm tra environment variables
const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_CALLBACK_URL',
    'JWT_SECRET',
    'DATABASE_URL'
];

let allConfigured = true;

console.log('📋 Environment Variables:');
requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
        console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '***' : value}`);
    } else {
        console.log(`❌ ${envVar}: NOT SET`);
        allConfigured = false;
    }
});

console.log('\n🔧 Google OAuth URLs:');
console.log(`📍 Authorization URL: https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&scope=profile email&response_type=code`);
console.log(`📍 Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);

console.log('\n🧪 Test Endpoints:');
console.log('GET  /api/auth/google          - Bắt đầu Google OAuth');
console.log('GET  /api/auth/google/callback - Google callback (tự động)');

if (allConfigured) {
    console.log('\n✅ Tất cả cấu hình đã sẵn sàng!');
    console.log('\n📖 Hướng dẫn sử dụng:');
    console.log('1. Khởi động server: npm run dev');
    console.log('2. Truy cập: http://localhost:3000/api/auth/google');
    console.log('3. Hoặc xem API docs: http://localhost:3000/api-docs');
} else {
    console.log('\n❌ Vui lòng cấu hình đầy đủ các environment variables!');
    console.log('📝 Xem file docs/GoogleOAuthSetup.md để biết thêm chi tiết.');
}
