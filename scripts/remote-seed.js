/**
 * Remote seed script cho PostgreSQL server độc lập
 * (ĐÃ CẬP NHẬT theo schema mới: VehicleModel, BatteryType)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRemoteDatabase() {
    try {
        console.log('🌱 Bắt đầu seed data vào remote PostgreSQL...\n');

        // 1. Test connection
        console.log('🔌 Kiểm tra kết nối database...');
        await prisma.$connect();
        console.log('✅ Kết nối database thành công!\n');

        // 2. Check existing data
        console.log('🔍 Kiểm tra dữ liệu hiện có...');
        const existingUsers = await prisma.user.count();
        const existingCenters = await prisma.serviceCenter.count();

        if (existingUsers > 0 || existingCenters > 0) {
            console.log(`📊 Database đã có dữ liệu: Users: ${existingUsers}, Centers: ${existingCenters}`);
            
            // Logic hỏi (Y/N) giữ nguyên
            const readline = require('readline');
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            const answer = await new Promise((resolve) => {
                rl.question('❓ Bạn có muốn xóa dữ liệu cũ và seed lại? (y/N): ', resolve);
            });
            rl.close();

            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                console.log('❌ Hủy seed data.');
                return;
            }

            // Clear existing data (Thêm Model và Pin)
            console.log('🗑️ Xóa dữ liệu cũ...');
            await prisma.appointmentService.deleteMany();
            await prisma.serviceAppointment.deleteMany();
            await prisma.inventoryItem.deleteMany();
            await prisma.part.deleteMany();
            await prisma.serviceType.deleteMany();
            await prisma.vehicle.deleteMany();
            // --- (SỬA LỖI 4) ---
            await prisma.batteryType.deleteMany();
            await prisma.vehicleModel.deleteMany();
            // --- (KẾT THÚC SỬA LỖI 4) ---
            await prisma.user.deleteMany();
            await prisma.serviceCenter.deleteMany();
            console.log('✅ Đã xóa dữ liệu cũ.\n');
        }

        // 3. Create Service Center
        console.log('🏢 Tạo trung tâm dịch vụ...');
        const serviceCenter = await prisma.serviceCenter.create({
            data: {
                name: 'EV Service Center Hồ Chí Minh',
                address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                phoneNumber: '028-1234-5678',
                capacityPerSlot: 2
            }
        });
        console.log('✅ Service Center:', serviceCenter.name);

        // 4. Create Users
        console.log('👥 Tạo users...');
        const usersData = [
            { fullName: 'System Administrator', email: 'admin@evservice.com', password: 'admin123', role: 'ADMIN', serviceCenterId: serviceCenter.id },
            { fullName: 'Station Manager', email: 'station@evservice.com', password: 'station123', role: 'STATION_ADMIN', serviceCenterId: serviceCenter.id },
            { fullName: 'Nguyễn Văn Staff', email: 'staff@evservice.com', password: 'staff123', role: 'STAFF', serviceCenterId: serviceCenter.id },
            { fullName: 'Lê Văn Technician', email: 'tech@evservice.com', password: 'tech123', role: 'TECHNICIAN', serviceCenterId: serviceCenter.id },
            { fullName: 'Nguyễn Văn Customer', email: 'customer@example.com', password: 'customer123', role: 'CUSTOMER' }
        ];

        const createdUsers = {};
        for (const userData of usersData) {
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
            createdUsers[userData.role] = user; // Lưu lại user đã tạo
            console.log(`✅ ${userData.role}: ${user.email}`);
        }

        // 5. Create Service Types
        console.log('🔧 Tạo service types...');
        const serviceTypesData = [
            { name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát' },
            { name: 'Sửa chữa pin', description: 'Thay thế và sửa chữa pin' },
            { name: 'Hệ thống phanh', description: 'Kiểm tra và thay má phanh' }
        ];
        const createdServiceTypes = [];
        for (const st of serviceTypesData) {
            const newSt = await prisma.serviceType.create({ data: st });
            createdServiceTypes.push(newSt);
        }
        console.log('✅ Service Types đã được tạo');

        // 6. Create Parts and Inventory
        console.log('📦 Tạo parts và inventory...');
        const partsData = [
            { sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8 (235/55 R19)', price: 4500000 },
            { sku: 'VF-BAT-COOL', name: 'Nước làm mát pin (1L)', price: 350000 },
            { sku: 'VF-BRAKE-PAD', name: 'Má phanh trước VinFast', price: 2100000 }
        ];
        for (const part of partsData) {
            const createdPart = await prisma.part.create({ data: part });
            await prisma.inventoryItem.create({
                data: {
                    partId: createdPart.id,
                    serviceCenterId: serviceCenter.id,
                    quantityInStock: 50,
                    minStockLevel: 10
                }
            });
        }
        console.log('✅ Parts và Inventory đã được tạo');

        // --- (SỬA LỖI 5) ---
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
        console.log('🚗 Tạo vehicle...');
        const customer = createdUsers['CUSTOMER'];
        const vehicle = await prisma.vehicle.create({
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
        console.log('✅ Vehicle:', modelVF8.brand, modelVF8.name);
        // --- (KẾT THÚC SỬA LỖI 5) ---

        // 9. Create Appointment
        console.log('📅 Tạo appointment...');
        await prisma.serviceAppointment.create({
            data: {
                appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'PENDING',
                customerNotes: 'Xe có tiếng kêu lạ ở phanh, cần kiểm tra',
                customerId: customer.id,
                vehicleId: vehicle.id,
                serviceCenterId: serviceCenter.id,
                requestedServices: {
                    create: [
                        { serviceTypeId: createdServiceTypes[0].id }, // Bảo dưỡng định kỳ
                        { serviceTypeId: createdServiceTypes[2].id }  // Hệ thống phanh
                    ]
                }
            }
        });
        console.log('✅ Appointment đã được tạo');

        console.log('\n🎉 Seed data hoàn tất!');
        console.log('\n📋 Thông tin đăng nhập:');
        console.log('👤 Admin: admin@evservice.com / admin123');
        console.log('👨‍💼 Station Admin: station@evservice.com / station123');
        console.log('👨‍🔧 Staff: staff@evservice.com / staff123');
        console.log('🔧 Technician: tech@evservice.com / tech123');
        console.log('👤 Customer: customer@example.com / customer123');

    } catch (error) {
        console.error('❌ Lỗi seed data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedRemoteDatabase()
        .then(() => {
            console.log('\n✅ Remote seed hoàn tất!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Remote seed thất bại:', error.message);
            process.exit(1);
        });
}

module.exports = seedRemoteDatabase;