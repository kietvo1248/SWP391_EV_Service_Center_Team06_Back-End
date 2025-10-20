const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Bắt đầu quá trình seeding...');

    // --- DỌN DẸP DỮ LIỆU CŨ (Thứ tự quan trọng để không vi phạm khóa ngoại) ---
    console.log('Xóa dữ liệu cũ...');
    await prisma.serviceAppointment.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO CÁC TÀI KHOẢN QUẢN LÝ CHUNG ---
    const password = await bcrypt.hash('123456', 10);// Mật khẩu chung cho tất cả tài khoản test

    // 1. Tạo Admin tổng (quản lý các trạm)
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
        // 2. Tạo trung tâm dịch vụ
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Center Quận ${i + 1}`,
                address: faker.location.streetAddress(),
                phoneNumber: faker.phone.number(),
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);

        // 3. Tạo Station Admin cho mỗi trung tâm
        await prisma.user.create({
            data: {
                fullName: `Station Admin ${center.name}`,
                email: `stationadmin${i + 1}@ev.com`,
                passwordHash: password,
                role: 'STATION_ADMIN',
                serviceCenterId: center.id, // Gán admin cho trung tâm này
                phoneNumber: faker.phone.number(),
            }
        });
        console.log(` -> Đã tạo Station Admin cho ${center.name}`);

        // 4. Tạo Kỹ thuật viên cho mỗi trung tâm
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
                },
            });
        }
        console.log(`  -> Đã tạo ${numberOfVehicles} xe cho ${customer.email}`);
    }

    // --- TẠO LỊCH HẸN MẪU ---
    const allVehicles = await prisma.vehicle.findMany();
    for (let i = 0; i < 5; i++) {
        const randomVehicle = faker.helpers.arrayElement(allVehicles);
        const randomCenter = faker.helpers.arrayElement(serviceCenters);

        await prisma.serviceAppointment.create({
            data: {
                appointmentDate: faker.date.future(),
                status: 'PENDING',
                customerNotes: faker.lorem.sentence(),
                customerId: randomVehicle.ownerId,
                vehicleId: randomVehicle.id,
                serviceCenterId: randomCenter.id,
            },
        });
    }
    console.log('Đã tạo 5 lịch hẹn mẫu.');

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