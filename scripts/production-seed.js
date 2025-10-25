/**
 * Production seed script cho Render deployment
 * Tạo dữ liệu mẫu cho production environment
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
                openingTime: '08:00',
                closingTime: '17:00',
                slotDurationMinutes: 60,
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
                userCode: 'ADMIN001',
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
                userCode: 'STATION001',
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
                userCode: 'STAFF001',
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
                userCode: 'TECH001',
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
                userCode: 'CUST001',
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
        const serviceTypes = [
            {
                id: 'service-type-1',
                name: 'Bảo dưỡng định kỳ',
                description: 'Kiểm tra tổng quát và bảo dưỡng theo khuyến nghị của nhà sản xuất'
            },
            {
                id: 'service-type-2',
                name: 'Sửa chữa pin',
                description: 'Thay thế và sửa chữa pin xe điện'
            },
            {
                id: 'service-type-3',
                name: 'Kiểm tra hệ thống điện',
                description: 'Kiểm tra và sửa chữa hệ thống điện tử'
            },
            {
                id: 'service-type-4',
                name: 'Dịch vụ lốp',
                description: 'Thay lốp, cân bằng động, đảo lốp'
            },
            {
                id: 'service-type-5',
                name: 'Hệ thống phanh',
                description: 'Kiểm tra và thay má phanh, dầu phanh'
            }
        ];

        for (const serviceType of serviceTypes) {
            await prisma.serviceType.upsert({
                where: { id: serviceType.id },
                update: {},
                create: serviceType
            });
        }
        console.log('✅ Service Types đã được tạo');

        // 8. Tạo Parts và Inventory
        console.log('📦 Tạo phụ tùng và kho hàng...');
        const parts = [
            {
                id: 'part-1',
                sku: 'VF-TYRE-001',
                name: 'Lốp VinFast VF8 (235/55 R19)',
                description: 'Lốp chuyên dụng cho VinFast VF8',
                price: 4500000
            },
            {
                id: 'part-2',
                sku: 'VF-BAT-COOL',
                name: 'Nước làm mát pin (1L)',
                description: 'Chất làm mát pin chuyên dụng',
                price: 350000
            },
            {
                id: 'part-3',
                sku: 'VF-FILTER-AC',
                name: 'Lọc gió điều hòa HEPA',
                description: 'Lọc gió điều hòa cao cấp',
                price: 780000
            },
            {
                id: 'part-4',
                sku: 'VF-BRAKE-PAD',
                name: 'Má phanh trước VinFast',
                description: 'Má phanh chuyên dụng cho xe VinFast',
                price: 2100000
            }
        ];

        for (const part of parts) {
            await prisma.part.upsert({
                where: { id: part.id },
                update: {},
                create: part
            });

            // Tạo inventory item cho service center
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

        // 9. Tạo Vehicle mẫu
        console.log('🚗 Tạo xe mẫu...');
        const vehicle = await prisma.vehicle.upsert({
            where: { vin: 'VF8VIN123456789' },
            update: {},
            create: {
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
        console.log('✅ Vehicle:', vehicle.make, vehicle.model);

        // 10. Tạo Appointment mẫu
        console.log('📅 Tạo lịch hẹn mẫu...');
        const appointment = await prisma.serviceAppointment.create({
            data: {
                appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
                status: 'PENDING',
                customerNotes: 'Xe có tiếng kêu lạ ở phanh, cần kiểm tra',
                customerId: customer.id,
                vehicleId: vehicle.id,
                serviceCenterId: serviceCenter.id,
                requestedServices: {
                    create: [
                        { serviceTypeId: 'service-type-1' }, // Bảo dưỡng định kỳ
                        { serviceTypeId: 'service-type-5' }  // Hệ thống phanh
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

// Chạy nếu file được gọi trực tiếp
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
