/**
 * Fix seed script - Simplified version without complex upserts
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixSeedData() {
    try {
        console.log('🔧 Fix seed data - Simplified version...\n');

        // 1. Clear existing data
        console.log('🗑️ Clearing existing data...');
        await prisma.appointmentService.deleteMany();
        await prisma.serviceAppointment.deleteMany();
        await prisma.inventoryItem.deleteMany();
        await prisma.part.deleteMany();
        await prisma.serviceType.deleteMany();
        await prisma.vehicle.deleteMany();
        await prisma.user.deleteMany();
        await prisma.serviceCenter.deleteMany();
        console.log('✅ Data cleared\n');

        // 2. Create Service Center
        console.log('🏢 Creating service center...');
        const serviceCenter = await prisma.serviceCenter.create({
            data: {
                name: 'EV Service Center Hồ Chí Minh',
                address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                phoneNumber: '028-1234-5678',
                openingTime: '08:00',
                closingTime: '17:00',
                slotDurationMinutes: 60,
                capacityPerSlot: 2
            }
        });
        console.log('✅ Service Center created');

        // 3. Create Users
        console.log('👥 Creating users...');
        const users = [
            {
                userCode: 'ADMIN001',
                fullName: 'System Administrator',
                email: 'admin@evservice.com',
                password: 'admin123',
                role: 'ADMIN',
                serviceCenterId: serviceCenter.id
            },
            {
                userCode: 'CUST001',
                fullName: 'Nguyễn Văn Customer',
                email: 'customer@example.com',
                password: 'customer123',
                role: 'CUSTOMER'
            }
        ];

        const createdUsers = [];
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await prisma.user.create({
                data: {
                    userCode: userData.userCode,
                    fullName: userData.fullName,
                    email: userData.email,
                    passwordHash: hashedPassword,
                    phoneNumber: `0901234${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                    address: `${Math.floor(Math.random() * 999) + 1} Street, TP.HCM`,
                    role: userData.role,
                    serviceCenterId: userData.serviceCenterId
                }
            });
            createdUsers.push(user);
            console.log(`✅ ${userData.role}: ${user.email}`);
        }

        // 4. Create Service Types
        console.log('🔧 Creating service types...');
        const serviceTypes = [
            { name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát và bảo dưỡng theo khuyến nghị' },
            { name: 'Sửa chữa pin', description: 'Thay thế và sửa chữa pin xe điện' }
        ];

        for (const serviceType of serviceTypes) {
            await prisma.serviceType.create({
                data: serviceType
            });
        }
        console.log('✅ Service Types created');

        // 5. Create Parts
        console.log('📦 Creating parts...');
        const parts = [
            { sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8', price: 4500000 },
            { sku: 'VF-BAT-COOL', name: 'Nước làm mát pin', price: 350000 }
        ];

        const createdParts = [];
        for (const part of parts) {
            const createdPart = await prisma.part.create({
                data: part
            });
            createdParts.push(createdPart);
        }
        console.log('✅ Parts created');

        // 6. Create Inventory Items
        console.log('📦 Creating inventory items...');
        for (const part of createdParts) {
            await prisma.inventoryItem.create({
                data: {
                    partId: part.id,
                    serviceCenterId: serviceCenter.id,
                    quantityInStock: 50,
                    minStockLevel: 10
                }
            });
        }
        console.log('✅ Inventory items created');

        // 7. Create Vehicle
        console.log('🚗 Creating vehicle...');
        const customer = createdUsers.find(u => u.role === 'CUSTOMER');
        const vehicle = await prisma.vehicle.create({
            data: {
                make: 'VinFast',
                model: 'VF8',
                year: 2023,
                vin: 'VF8VIN123456789',
                licensePlate: '51A-12345',
                currentMileage: 15000,
                lastServiceDate: new Date('2024-01-15'),
                ownerId: customer.id
            }
        });
        console.log('✅ Vehicle created');

        console.log('\n🎉 Fix seed data completed!');
        console.log('\n📋 Login credentials:');
        console.log('👤 Admin: admin@evservice.com / admin123');
        console.log('👤 Customer: customer@example.com / customer123');

    } catch (error) {
        console.error('❌ Error in fix seed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
    fixSeedData()
        .then(() => {
            console.log('\n✅ Fix seed completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Fix seed failed:', error.message);
            process.exit(1);
        });
}

module.exports = fixSeedData;
