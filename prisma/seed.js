// Tệp: prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Hàm tạo các loại dịch vụ
async function seedServiceTypes() {
    console.log('Đang tạo các loại dịch vụ...');
    const serviceTypesData = [
        { name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát và bảo dưỡng theo khuyến nghị của nhà sản xuất.' },
        { name: 'Kiểm tra và Bảo dưỡng Pin', description: 'Đo lường dung lượng, kiểm tra hệ thống làm mát pin.' },
        { name: 'Dịch vụ Lốp', description: 'Thay lốp, cân bằng động, đảo lốp.' },
        { name: 'Hệ thống Phanh', description: 'Kiểm tra và thay má phanh, dầu phanh.' },
        { name: 'Lọc gió điều hòa', description: 'Thay thế lọc gió điều hòa.' }
    ];

    await prisma.serviceType.createMany({
        data: serviceTypesData,
        skipDuplicates: true, // Bỏ qua nếu đã tồn tại
    });

    console.log('Đã tạo xong các loại dịch vụ.');
    return prisma.serviceType.findMany(); // Trả về các dịch vụ đã tạo
}

// Hàm tạo Phụ tùng và Kho hàng
async function seedPartsAndInventory(serviceCenters) {
    console.log('Đang tạo phụ tùng và kho hàng...');
    const partsData = [
        { sku: 'VIN-TYRE-001', name: 'Lốp Michelin Pilot Sport EV', price: 5500000 },
        { sku: 'VIN-BAT-COOL', name: 'Nước làm mát pin (1L)', price: 350000 },
        { sku: 'VIN-FILTER-AC', name: 'Lọc gió điều hòa HEPA', price: 780000 },
        { sku: 'VIN-BRAKE-PAD', name: 'Má phanh trước (Bộ)', price: 2100000 },
    ];

    const createdParts = [];
    for (const part of partsData) {
        const newPart = await prisma.part.upsert({
            where: { sku: part.sku },
            update: {},
            create: part,
        });
        createdParts.push(newPart);
        console.log(` -> Đã tạo/cập nhật phụ tùng: ${newPart.name}`);
    }

    // Với mỗi phụ tùng, tạo kho hàng tại mỗi trung tâm
    for (const center of serviceCenters) {
        for (const part of createdParts) {
            await prisma.inventoryItem.create({
                data: {
                    partId: part.id,
                    serviceCenterId: center.id,
                    quantityInStock: faker.number.int({ min: 10, max: 100 }),
                    minStockLevel: 10,
                },
            });
        }
        console.log(` -> Đã tạo kho hàng cho trung tâm ${center.name}`);
    }
}


async function main() {
    console.log('Bắt đầu quá trình seeding...');

    // --- DỌN DẸP DỮ LIỆU CŨ (Thứ tự quan trọng) ---
    console.log('Xóa dữ liệu cũ...');
    // Bảng nối
    await prisma.appointmentService.deleteMany();
    // Bảng chính
    await prisma.serviceAppointment.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.part.deleteMany();
    await prisma.serviceType.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO CÁC TÀI KHOẢN QUẢN LÝ CHUNG ---
    const password = await bcrypt.hash('123456', 10);
    const admin = await prisma.user.create({
        data: {
            fullName: 'Admin Master',
            email: 'admin@ev.com',
            passwordHash: password,
            role: 'ADMIN',
            phoneNumber: faker.phone.number(),
        },
    });
    console.log(`Đã tạo tài khoản Admin tổng: ${admin.email}`);
    
    // --- TẠO DỮ LIỆU CHO TỪNG TRUNG TÂM ---
    const serviceCenters = [];
    for (let i = 0; i < 3; i++) {
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Center Quận ${i + 1}`,
                address: faker.location.streetAddress(),
                phoneNumber: faker.phone.number(),
                // Cấu hình giờ làm việc và slot (dựa theo schema)
                openingTime: '08:00',
                closingTime: '17:00',
                slotDurationMinutes: 60,
                capacityPerSlot: 2, // Mỗi slot 1 tiếng nhận tối đa 2 xe
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);

        // 3. Tạo Station Admin
        await prisma.user.create({
            data: {
                fullName: `Station Admin ${center.name}`,
                email: `stationadmin${i + 1}@ev.com`,
                passwordHash: password,
                role: 'STATION_ADMIN',
                serviceCenterId: center.id,
                phoneNumber: faker.phone.number(),
            }
        });
        console.log(` -> Đã tạo Station Admin cho ${center.name}`);

        // 4. Tạo Kỹ thuật viên
        await prisma.user.create({
            data: {
                fullName: `Technician ${faker.person.firstName()}`,
                email: `tech_center${i+1}@ev.com`,
                passwordHash: password,
                role: 'TECHNICIAN',
                serviceCenterId: center.id,
                phoneNumber: faker.phone.number(),
            },
        });
        console.log(` -> Đã tạo tài khoản Kỹ thuật viên cho ${center.name}`);
    }

    // --- TẠO KHÁCH HÀNG VÀ XE CỦA HỌ ---
    const customers = [];
    for (let i = 0; i < 10; i++) {
        const customer = await prisma.user.create({
            data: {
                fullName: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                passwordHash: password,
                role: 'CUSTOMER',
                phoneNumber: faker.phone.number(),
                address: faker.location.streetAddress(),
            },
        });
        customers.push(customer);
        console.log(`Đã tạo khách hàng: ${customer.email}`);

        // Tạo 1-2 xe cho mỗi khách hàng
        const numberOfVehicles = faker.number.int({ min: 1, max: 2 });
        for (let j = 0; j < numberOfVehicles; j++) {
            await prisma.vehicle.create({
                data: {
                    make: 'VinFast',
                    model: faker.helpers.arrayElement(['VF8', 'VF9', 'VF e34', 'VF7']),
                    year: faker.number.int({ min: 2022, max: 2025 }),
                    vin: faker.vehicle.vin(),
                    licensePlate: faker.vehicle.vrm(),
                    ownerId: customer.id,
                    currentMileage: faker.number.int({ min: 5000, max: 80000 }),
                },
            });
        }
        console.log(`  -> Đã tạo ${numberOfVehicles} xe cho ${customer.email}`);
    }

    // --- TẠO CÁC LOẠI DỊCH VỤ ---
    const serviceTypes = await seedServiceTypes();

    // --- TẠO PHỤ TÙNG VÀ KHO HÀNG ---
    await seedPartsAndInventory(serviceCenters);

    // --- TẠO LỊCH HẸN MẪU (NÂNG CAO) ---
    console.log('Đang tạo lịch hẹn mẫu (có liên kết dịch vụ)...');
    const allVehicles = await prisma.vehicle.findMany();
    for (let i = 0; i < 5; i++) {
        const randomVehicle = faker.helpers.arrayElement(allVehicles);
        const randomCenter = faker.helpers.arrayElement(serviceCenters);
        
        // Chọn ngẫu nhiên 1 hoặc 2 dịch vụ
        const servicesToBook = faker.helpers.arrayElements(serviceTypes, { min: 1, max: 2 });

        // Tạo ngày hẹn (trong 2 tuần tới, vào lúc 9h sáng)
        const appointmentDate = faker.date.soon({ days: 14 });
        appointmentDate.setHours(faker.helpers.arrayElement([9, 10, 11, 14, 15]), 0, 0, 0);

        await prisma.serviceAppointment.create({
            data: {
                appointmentDate: appointmentDate,
                status: 'PENDING',
                customerNotes: 'Vui lòng kiểm tra kỹ hệ thống phanh.',
                customerId: randomVehicle.ownerId,
                vehicleId: randomVehicle.id,
                serviceCenterId: randomCenter.id,
                
                // Cú pháp create lồng nhau của Prisma
                // Tự động tạo bản ghi trong AppointmentService
                requestedServices: {
                    create: servicesToBook.map(service => ({
                        serviceTypeId: service.id,
                    })),
                },
            },
        });
    }
    console.log('Đã tạo 5 lịch hẹn mẫu (có liên kết dịch vụ).');

    console.log('Hoàn tất quá trình seeding!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });