/**
 * Database initialization script cho Render deployment
 * Chạy migrations và seed data
 */

const { PrismaClient } = require('@prisma/client');
const createProductionSeedData = require('./production-seed');

const prisma = new PrismaClient();

async function initializeDatabase() {
    try {
        console.log('🚀 Bắt đầu khởi tạo database...\n');

        // 1. Test database connection
        console.log('🔌 Kiểm tra kết nối database...');
        await prisma.$connect();
        console.log('✅ Database connection thành công!\n');

        // 2. Check if database is already seeded
        console.log('🔍 Kiểm tra dữ liệu hiện có...');
        const existingUsers = await prisma.user.count();

        if (existingUsers > 0) {
            console.log(`📊 Database đã có ${existingUsers} users. Bỏ qua seed data.`);
            console.log('✅ Database đã được khởi tạo trước đó.');
            return;
        }

        // 3. Run production seed
        console.log('🌱 Chạy production seed data...');
        await createProductionSeedData();

        console.log('\n🎉 Database initialization hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('\n✅ Database initialization hoàn tất!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Database initialization thất bại:', error.message);
            process.exit(1);
        });
}

module.exports = initializeDatabase;
