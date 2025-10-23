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
        skipDuplicates: true,
    });

    console.log('Đã tạo xong các loại dịch vụ.');
    return prisma.serviceType.findMany();
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

// Hàm tạo lịch hẹn cho một khách hàng
async function seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, techniciansByCenter) {
    console.log(`Đang tạo lịch hẹn cho khách hàng: ${customer.email}`);
    const vehicles = await prisma.vehicle.findMany({ where: { ownerId: customer.id } });
    if (vehicles.length === 0) {
        console.log(` -> Khách hàng ${customer.email} chưa có xe, bỏ qua tạo lịch hẹn.`);
        return;
    }

    // Tạo 2 lịch hẹn cho mỗi khách hàng
    for (let i = 0; i < 2; i++) {
        const randomVehicle = faker.helpers.arrayElement(vehicles);
        const randomCenter = faker.helpers.arrayElement(serviceCenters);
        const servicesToBook = faker.helpers.arrayElements(serviceTypes, { min: 1, max: 2 });
        
        // Ngẫu nhiên trạng thái PENDING hoặc COMPLETED
        const status = (i % 2 === 0) ? 'PENDING' : 'COMPLETED';
        let appointmentDate;
        
        if (status === 'PENDING') {
            // Lịch hẹn PENDING -> đặt ở tương lai
            appointmentDate = faker.date.soon({ days: 14 });
            appointmentDate.setHours(faker.helpers.arrayElement([9, 10, 11, 14, 15]), 0, 0, 0);
        } else {
            // Lịch hẹn COMPLETED -> đặt ở quá khứ
            appointmentDate = faker.date.recent({ days: 30 });
            appointmentDate.setHours(faker.helpers.arrayElement([9, 10, 11, 14, 15]), 0, 0, 0);
        }

        const appointmentData = {
            appointmentDate: appointmentDate,
            status: status,
            customerNotes: 'Vui lòng kiểm tra kỹ hệ thống phanh.',
            customerId: customer.id,
            vehicleId: randomVehicle.id,
            serviceCenterId: randomCenter.id,
            requestedServices: {
                create: servicesToBook.map(service => ({
                    serviceTypeId: service.id,
                })),
            },
        };

        // Nếu lịch hẹn đã hoàn thành, tạo luôn ServiceRecord
        if (status === 'COMPLETED') {
            const centerTechnicians = techniciansByCenter[randomCenter.id];
            const randomTechnician = faker.helpers.arrayElement(centerTechnicians);
            
            appointmentData.serviceRecord = {
                create: {
                    technicianId: randomTechnician.id,
                    status: 'COMPLETED',
                    startTime: appointmentDate,
                    endTime: new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000), // Giả sử làm trong 2 tiếng
                    staffNotes: 'Đã hoàn thành bảo dưỡng theo yêu cầu.'
                }
            };
        }

        await prisma.serviceAppointment.create({ data: appointmentData });
    }
    console.log(` -> Đã tạo 2 lịch hẹn cho ${customer.email}`);
}


async function main() {
    console.log('Bắt đầu quá trình seeding...');
    const password = await bcrypt.hash('123456', 10);

    // --- DỌN DẸP DỮ LIỆU CŨ (Thứ tự quan trọng) ---
    console.log('Xóa dữ liệu cũ...');
    await prisma.appointmentService.deleteMany();
    await prisma.serviceRecord.deleteMany(); // Thêm dọn dẹp ServiceRecord
    await prisma.serviceAppointment.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.part.deleteMany();
    await prisma.serviceType.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO CÁC LOẠI DỊCH VỤ ---
    const serviceTypes = await seedServiceTypes();

    // --- TẠO TÀI KHOẢN ADMIN TỔNG ---
    await prisma.user.create({
        data: {
            fullName: 'Admin Master',
            email: 'admin@ev.com',
            passwordHash: password,
            role: 'ADMIN',
            phoneNumber: faker.phone.number(),
        },
    });
    console.log('Đã tạo tài khoản Admin tổng: admin@ev.com');

    // --- TẠO DỮ LIỆU TRUNG TÂM VÀ NHÂN VIÊN ---
    const serviceCenters = [];
    // Lưu trữ KTV theo ID trung tâm để tạo ServiceRecord
    const techniciansByCenter = {}; 

    for (let i = 0; i < 3; i++) {
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Center Quận ${i + 1}`,
                address: faker.location.streetAddress(),
                phoneNumber: faker.phone.number(),
                openingTime: '08:00',
                closingTime: '17:00',
                slotDurationMinutes: 60,
                capacityPerSlot: 2,
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);

        techniciansByCenter[center.id] = [];

        // Tạo 1 Station Admin cho mỗi trung tâm
        await prisma.user.create({
            data: {
                fullName: `Station Admin (Q.${i + 1})`,
                email: `stationadmin${i + 1}@ev.com`,
                passwordHash: password,
                role: 'STATION_ADMIN',
                serviceCenterId: center.id,
                phoneNumber: faker.phone.number(),
            }
        });

        // Tạo 1 Staff cho mỗi trung tâm (ngoại trừ trung tâm 1 để dùng tài khoản test)
        if (i > 0) { // Bỏ qua trung tâm 0 (Quận 1)
            await prisma.user.create({
                data: {
                    fullName: `Staff (Q.${i + 1})`,
                    email: `staff${i + 1}@ev.com`,
                    passwordHash: password,
                    role: 'STAFF',
                    serviceCenterId: center.id,
                    phoneNumber: faker.phone.number(),
                }
            });
        }
        
        // Tạo 2 Technicians cho mỗi trung tâm (ngoại trừ trung tâm 1 để dùng tài khoản test)
        for (let j = 0; j < 2; j++) {
            if (i === 0 && j === 0) continue; // Bỏ qua 1 slot ở Q1 để dùng tài khoản test

            const tech = await prisma.user.create({
                data: {
                    fullName: `Technician ${faker.person.firstName()} (Q.${i + 1})`,
                    email: `tech${i+1}_${j+1}@ev.com`,
                    passwordHash: password,
                    role: 'TECHNICIAN',
                    serviceCenterId: center.id,
                    phoneNumber: faker.phone.number(),
                },
            });
            techniciansByCenter[center.id].push(tech);
        }
        console.log(` -> Đã tạo nhân sự cho ${center.name}`);
    }

    // --- TẠO PHỤ TÙNG VÀ KHO HÀNG ---
    await seedPartsAndInventory(serviceCenters);

    // --- TẠO CÁC TÀI KHOẢN CỐ ĐỊNH ĐỂ TEST ---
    console.log('Đang tạo các tài khoản test cố định...');
    const center1Id = serviceCenters[0].id;

    // 1. Tài khoản Customer Test
    const customerTest = await prisma.user.create({
        data: {
            fullName: 'Customer Test',
            email: 'customer-test@ev.com',
            passwordHash: password,
            role: 'CUSTOMER',
            phoneNumber: '0909123456',
            address: '123 Đường Test, Quận 1',
        },
    });
    // Tạo 2 xe cho Customer Test
    await prisma.vehicle.create({
        data: {
            make: 'VinFast', model: 'VF8', year: 2023,
            vin: faker.vehicle.vin(), licensePlate: 'TEST-001',
            ownerId: customerTest.id, currentMileage: 15000,
        },
    });
    await prisma.vehicle.create({
        data: {
            make: 'VinFast', model: 'VF9', year: 2024,
            vin: faker.vehicle.vin(), licensePlate: 'TEST-002',
            ownerId: customerTest.id, currentMileage: 5000,
        },
    });

    // 2. Tài khoản Staff Test (Quận 1)
    await prisma.user.create({
        data: {
            fullName: 'Staff Test (Quận 1)',
            email: 'staff-q1@ev.com',
            passwordHash: password,
            role: 'STAFF',
            serviceCenterId: center1Id,
            phoneNumber: '0909111222',
        },
    });
    
    // 3. Tài khoản Technician Test (Quận 1)
    const techTest = await prisma.user.create({
        data: {
            fullName: 'Technician Test (Quận 1)',
            email: 'tech-q1@ev.com',
            passwordHash: password,
            role: 'TECHNICIAN',
            serviceCenterId: center1Id,
            phoneNumber: '0909333444',
        },
    });
    techniciansByCenter[center1Id].push(techTest); // Thêm vào danh sách KTV của Q1
    
    console.log(' -> Đã tạo xong tài khoản test (pass: 123456)');
    
    // --- TẠO KHÁCH HÀNG FAKE VÀ XE CỦA HỌ ---
    const customers = [customerTest]; // Bắt đầu với tài khoản test
    
    for (let i = 0; i < 5; i++) { // Tạo thêm 5 khách hàng fake
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
    }
    console.log(`Đã tạo tổng cộng ${customers.length} khách hàng và xe của họ.`);

    // --- TẠO LỊCH HẸN CHO TẤT CẢ KHÁCH HÀNG ---
    for (const customer of customers) {
        await seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, techniciansByCenter);
    }
    
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