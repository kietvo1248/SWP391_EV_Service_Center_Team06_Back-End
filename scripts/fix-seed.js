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
        
        // Xóa các bảng mới
        await prisma.batteryType.deleteMany();
        await prisma.vehicleModel.deleteMany();

        await prisma.user.deleteMany();
        await prisma.serviceCenter.deleteMany();
        console.log('✅ Data cleared\n');

        // 2. Create Service Center (Giữ nguyên)
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

        // 3. Create Users (Admin và Customer) (Giữ nguyên)
        console.log('👥 Creating users...');
        // ... (Giữ nguyên logic tạo user của bạn) ...
        const users = [
            {
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

        // 4. Create Service Types (Giữ nguyên)
        console.log('🔧 Creating service types...');
        // ... (Giữ nguyên logic) ...
        await prisma.serviceType.createMany({
            data: [
                { name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát' },
                { name: 'Sửa chữa pin', description: 'Thay thế và sửa chữa pin' }
            ]
        });
        console.log('✅ Service Types created');

        // 5. Create Parts (Giữ nguyên)
        console.log('📦 Creating parts...');
        // ... (Giữ nguyên logic) ...
        const createdParts = [];
        for (const part of [{ sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8', price: 4500000 }]) {
            const createdPart = await prisma.part.create({ data: part });
            createdParts.push(createdPart);
        }
        console.log('✅ Parts created');

        // 6. Create Inventory Items (Giữ nguyên)
        console.log('📦 Creating inventory items...');
        // ... (Giữ nguyên logic) ...
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
        // 7. Tạo Dữ liệu Gốc cho Xe (Bỏ ID cứng)
        console.log('🚗 Tạo Dòng xe (Model) và Loại pin (Battery)...');
        
        // Bỏ 'id: "bat-lfp-90"'
        const battery90 = await prisma.batteryType.create({
            data: { 
                name: 'Pin LFP 90kWh (Thuê)', 
                capacityKwh: 90 
            },
        });

        // Bỏ 'id: "model-vf8"'
        const modelVF8 = await prisma.vehicleModel.create({
            data: {
                brand: 'VinFast',
                name: 'VF8',
                compatibleBatteries: {
                    connect: [{ id: battery90.id }] // Dùng ID vừa tạo
                }
            },
            include: { compatibleBatteries: true } // Lấy cả pin để dùng ở Bước 8
        });
        console.log('✅ Đã tạo Model và Pin.');

        // 8. Create Vehicle (Sử dụng schema mới)
        console.log('🚗 Creating vehicle...');
        const customer = createdUsers.find(u => u.role === 'CUSTOMER');
        await prisma.vehicle.create({
            data: {
                // Xóa các trường cũ: make, model, currentMileage, lastServiceDate
                vehicleModelId: modelVF8.id, // Dùng ID (UUID) thật
                batteryId: modelVF8.compatibleBatteries[0].id, // Dùng ID (UUID) thật
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