/**
 * Fix seed script - Đã cập nhật cho schema mới (VehicleModel, BatteryType)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixSeedData() {
    try {
        console.log('🔧 Fix seed data - (Đã cập nhật)...');

        // 1. Clear existing data (Thêm Model và Pin)
        console.log('🗑️ Clearing existing data...');
        await prisma.appointmentService.deleteMany();
        await prisma.serviceAppointment.deleteMany();
        await prisma.inventoryItem.deleteMany();
        await prisma.part.deleteMany();
        await prisma.serviceType.deleteMany();
        await prisma.vehicle.deleteMany();
        
        // --- (SỬA LỖI 2) ---
        // Phải xóa liên kết N-N trước (nếu có)
        // (Bỏ qua vì chúng ta sẽ xóa cả 2 bảng)
        await prisma.batteryType.deleteMany();
        await prisma.vehicleModel.deleteMany();
        // --- (KẾT THÚC SỬA LỖI 2) ---

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
                capacityPerSlot: 2
            }
        });
        console.log('✅ Service Center created');

        // 3. Create Users (Admin và Customer)
        console.log('👥 Creating users...');
        const users = [
            {
                // (Xóa userCode)
                fullName: 'System Administrator',
                email: 'admin@evservice.com',
                password: 'admin123',
                role: 'ADMIN',
                serviceCenterId: serviceCenter.id
            },
            {
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
        await prisma.serviceType.createMany({
            data: [
                { name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát' },
                { name: 'Sửa chữa pin', description: 'Thay thế và sửa chữa pin' }
            ]
        });
        console.log('✅ Service Types created');

        // 5. Create Parts
        console.log('📦 Creating parts...');
        const createdParts = [];
        for (const part of [{ sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8', price: 4500000 }]) {
            const createdPart = await prisma.part.create({ data: part });
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

        // --- (SỬA LỖI 3) ---
        // 7. Tạo Dữ liệu Gốc cho Xe (Model và Pin)
        console.log('🚗 Tạo Dòng xe (Model) và Loại pin (Battery)...');
        const battery90 = await prisma.batteryType.create({
            data: { id: 'bat-lfp-90', name: 'Pin LFP 90kWh (Thuê)', capacityKwh: 90 },
        });

        const modelVF8 = await prisma.vehicleModel.create({
            data: {
                id: 'model-vf8',
                brand: 'VinFast',
                name: 'VF8',
                compatibleBatteries: {
                    connect: [{ id: battery90.id }]
                }
            },
            include: { compatibleBatteries: true }
        });
        console.log('✅ Đã tạo Model và Pin.');

        // 8. Create Vehicle (Sử dụng schema mới)
        console.log('🚗 Creating vehicle...');
        const customer = createdUsers.find(u => u.role === 'CUSTOMER');
        await prisma.vehicle.create({
            data: {
                // make: 'VinFast', (XÓA)
                // model: 'VF8', (XÓA)
                // currentMileage: 15000, (XÓA)
                // lastServiceDate: new Date('2024-01-15'), (XÓA)

                vehicleModelId: modelVF8.id, // (THÊM)
                batteryId: modelVF8.compatibleBatteries[0].id, // (THÊM)
                year: 2023,
                vin: 'VF8VIN123456789',
                licensePlate: '51A-12345',
                ownerId: customer.id
            }
        });
        console.log('✅ Vehicle created');
        // --- (KẾT THÚC SỬA LỖI 3) ---

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