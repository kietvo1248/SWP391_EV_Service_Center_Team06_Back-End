/**
 * Production seed script cho Render deployment
 * Tạo dữ liệu mẫu cho production environment
 * (ĐÃ CẬP NHẬT theo schema mới: VehicleModel, BatteryType)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProductionSeedData() {
    try {
        console.log('🌱 Bắt đầu tạo dữ liệu mẫu cho production...\n');

        // 1. Tạo Service Center mẫu
        console.log('🏢 Tạo trung tâm dịch vụ...');
        const serviceCenter = await prisma.serviceCenter.upsert({
            where: { id: 'prod-service-center-1' },
            update: {},
            create: {
                id: 'prod-service-center-1',
                name: 'EV Service Center Hồ Chí Minh',
                address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                phoneNumber: '028-1234-5678',
                capacityPerSlot: 2
            }
        });
        console.log('✅ Service Center:', serviceCenter.name);

        // 2. Tạo Admin user
        console.log('👤 Tạo tài khoản admin...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@evservice.com' },
            update: {},
            create: {
                // (Lưu ý: userCode không có trong schema mới nhất, đã xóa)
                fullName: 'System Administrator',
                email: 'admin@evservice.com',
                passwordHash: adminPassword,
                phoneNumber: '0901234567',
                address: '123 Admin Street, TP.HCM',
                role: 'ADMIN',
                serviceCenterId: serviceCenter.id
            }
        });
        console.log('✅ Admin user:', admin.email);

        // 3. Tạo Station Admin
        console.log('👨‍💼 Tạo Station Admin...');
        const stationAdminPassword = await bcrypt.hash('station123', 10);
        const stationAdmin = await prisma.user.upsert({
            where: { email: 'station@evservice.com' },
            update: {},
            create: {
                fullName: 'Station Manager',
                email: 'station@evservice.com',
                passwordHash: stationAdminPassword,
                phoneNumber: '0901234568',
                address: '456 Station Street, TP.HCM',
                role: 'STATION_ADMIN',
                serviceCenterId: serviceCenter.id
            }
        });
        console.log('✅ Station Admin:', stationAdmin.email);

        // 4. Tạo Staff user
        console.log('👨‍🔧 Tạo tài khoản staff...');
        const staffPassword = await bcrypt.hash('staff123', 10);
        const staff = await prisma.user.upsert({
            where: { email: 'staff@evservice.com' },
            update: {},
            create: {
                fullName: 'Nguyễn Văn Staff',
                email: 'staff@evservice.com',
                passwordHash: staffPassword,
                phoneNumber: '0901234569',
                address: '789 Staff Street, TP.HCM',
                role: 'STAFF',
                serviceCenterId: serviceCenter.id
            }
        });
        console.log('✅ Staff user:', staff.email);

        // 5. Tạo Technician
        console.log('🔧 Tạo Technician...');
        const techPassword = await bcrypt.hash('tech123', 10);
        const technician = await prisma.user.upsert({
            where: { email: 'tech@evservice.com' },
            update: {},
            create: {
                fullName: 'Lê Văn Technician',
                email: 'tech@evservice.com',
                passwordHash: techPassword,
                phoneNumber: '0901234570',
                address: '101 Tech Street, TP.HCM',
                role: 'TECHNICIAN',
                serviceCenterId: serviceCenter.id
            }
        });
        console.log('✅ Technician:', technician.email);

        // 6. Tạo Customer user
        console.log('👤 Tạo tài khoản customer...');
        const customerPassword = await bcrypt.hash('customer123', 10);
        const customer = await prisma.user.upsert({
            where: { email: 'customer@example.com' },
            update: {},
            create: {
                fullName: 'Nguyễn Văn Customer',
                email: 'customer@example.com',
                passwordHash: customerPassword,
                phoneNumber: '0901234571',
                address: '202 Customer Street, TP.HCM',
                role: 'CUSTOMER'
            }
        });
        console.log('✅ Customer user:', customer.email);

        // 7. Tạo Service Types
        console.log('🔧 Tạo các loại dịch vụ...');
        const serviceTypesData = [
            { id: 'service-type-1', name: 'Bảo dưỡng định kỳ' },
            { id: 'service-type-2', name: 'Sửa chữa pin' },
            { id: 'service-type-3', name: 'Kiểm tra hệ thống điện' },
            { id: 'service-type-4', name: 'Dịch vụ lốp' },
            { id: 'service-type-5', name: 'Hệ thống phanh' }
        ];
        const serviceTypes = [];
        for (const serviceType of serviceTypesData) {
            const st = await prisma.serviceType.upsert({
                where: { id: serviceType.id },
                update: {},
                create: serviceType
            });
            serviceTypes.push(st);
        }
        console.log('✅ Service Types đã được tạo');

        // 8. Tạo Parts và Inventory
        console.log('📦 Tạo phụ tùng và kho hàng...');
        const partsData = [
            { id: 'part-1', sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8 (235/55 R19)', price: 4500000 },
            { id: 'part-2', sku: 'VF-BAT-COOL', name: 'Nước làm mát pin (1L)', price: 350000 },
            { id: 'part-3', sku: 'VF-FILTER-AC', name: 'Lọc gió điều hòa HEPA', price: 780000 },
            { id: 'part-4', sku: 'VF-BRAKE-PAD', name: 'Má phanh trước VinFast', price: 2100000 }
        ];
        for (const part of partsData) {
            await prisma.part.upsert({
                where: { id: part.id },
                update: {},
                create: part
            });
            await prisma.inventoryItem.create({
                data: {
                    partId: part.id,
                    serviceCenterId: serviceCenter.id,
                    quantityInStock: 50,
                    minStockLevel: 10
                }
            });
        }
        console.log('✅ Parts và Inventory đã được tạo');

        // --- (SỬA LỖI 1) ---
        // 9. Tạo Dữ liệu Gốc cho Xe (Model và Pin)
        console.log('🚗 Tạo Dòng xe (Model) và Loại pin (Battery)...');
        const battery90 = await prisma.batteryType.upsert({
            where: { name: 'Pin LFP 90kWh (Thuê)' },
            update: {},
            create: { id: 'bat-lfp-90', name: 'Pin LFP 90kWh (Thuê)', capacityKwh: 90 },
        });

        const modelVF8 = await prisma.vehicleModel.upsert({
            where: { id: 'model-vf8' },
            update: {},
            create: {
                id: 'model-vf8',
                brand: 'VinFast',
                name: 'VF8',
                compatibleBatteries: {
                    connect: [{ id: battery90.id }] // VF8 tương thích với pin 90
                }
            },
            include: { compatibleBatteries: true }
        });
        console.log('✅ Đã tạo Model và Pin.');

        // 10. Tạo Vehicle mẫu (Sử dụng schema mới)
        console.log('🚗 Tạo xe mẫu...');
        const vehicle = await prisma.vehicle.upsert({
            where: { vin: 'VF8VIN123456789' },
            update: {},
            create: {
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
        // --- (KẾT THÚC SỬA LỖI 1) ---

        // 11. Tạo Appointment mẫu
        console.log('📅 Tạo lịch hẹn mẫu...');
        await prisma.serviceAppointment.create({
            data: {
                appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
                status: 'PENDING',
                customerNotes: 'Xe có tiếng kêu lạ ở phanh, cần kiểm tra',
                customerId: customer.id,
                vehicleId: vehicle.id,
                serviceCenterId: serviceCenter.id,
                requestedServices: {
                    create: [
                        { serviceTypeId: serviceTypes[0].id }, // Bảo dưỡng định kỳ
                        { serviceTypeId: serviceTypes[4].id }  // Hệ thống phanh
                    ]
                }
            }
        });
        console.log('✅ Appointment đã được tạo');

        console.log('\n🎉 Production seed data hoàn tất!');
        console.log('\n📋 Thông tin đăng nhập:');
        console.log('👤 Admin: admin@evservice.com / admin123');
        console.log('👨‍💼 Station Admin: station@evservice.com / station123');
        console.log('👨‍🔧 Staff: staff@evservice.com / staff123');
        console.log('🔧 Technician: tech@evservice.com / tech123');
        console.log('👤 Customer: customer@example.com / customer123');

    } catch (error) {
        console.error('❌ Lỗi tạo seed data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    createProductionSeedData()
        .then(() => {
            console.log('\n✅ Production seed hoàn tất!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Production seed thất bại:', error.message);
            process.exit(1);
        });
}

module.exports = createProductionSeedData;