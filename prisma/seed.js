// Tệp: prisma/seed.js

const { PrismaClient, Prisma, Role, AppointmentStatus, ServiceRecordStatus, InvoiceStatus, PaymentStatus } = require('@prisma/client'); // Import Enums
const { faker } = require('@faker-js/faker/locale/vi'); // Sử dụng locale vi
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// --- HÀM TẠO DỮ LIỆU PHỤ TRỢ ---

// Tạo các loại dịch vụ (tương tự production-seed)
async function seedServiceTypes() {
    console.log('Đang tạo các loại dịch vụ...');
    const serviceTypesData = [
        { id: 'svt-bdk', name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát và bảo dưỡng theo khuyến nghị.' },
        { id: 'svt-pin', name: 'Kiểm tra Pin Cao Áp', description: 'Đo dung lượng, kiểm tra hệ thống làm mát.' },
        { id: 'svt-lop', name: 'Dịch vụ Lốp Xe', description: 'Thay lốp, cân bằng động, đảo lốp.' },
        { id: 'svt-phanh', name: 'Hệ thống Phanh', description: 'Kiểm tra má phanh, đĩa phanh, dầu phanh.' },
        { id: 'svt-dhoa', name: 'Hệ thống Điều hòa', description: 'Kiểm tra gas, thay lọc gió cabin.' },
        { id: 'svt-sw', name: 'Cập nhật Phần mềm', description: 'Cập nhật phiên bản phần mềm mới nhất cho xe.' },
    ];
    // Dùng upsert để đảm bảo ID cố định nếu chạy lại seed
    for (const data of serviceTypesData) {
        await prisma.serviceType.upsert({
            where: { id: data.id },
            update: { name: data.name, description: data.description },
            create: data,
        });
    }
    console.log(' -> Đã tạo xong các loại dịch vụ.');
    return prisma.serviceType.findMany();
}

// Tạo Phụ tùng và Kho hàng (tương tự production-seed)
async function seedPartsAndInventory(serviceCenters) {
    console.log('Đang tạo phụ tùng và kho hàng...');
    const partsData = [
        { id: 'part-lop', sku: 'VIN-TYRE-001', name: 'Lốp Michelin Pilot Sport EV 235/55 R19', price: 5500000, description: 'Lốp hiệu suất cao cho xe điện.' },
        { id: 'part-cool', sku: 'VIN-BAT-COOL-1L', name: 'Nước làm mát pin (1L)', price: 350000, description: 'Dung dịch làm mát chuyên dụng.' },
        { id: 'part-filter', sku: 'VIN-FILTER-AC-HEPA', name: 'Lọc gió điều hòa HEPA PM2.5', price: 780000, description: 'Lọc bụi mịn và tác nhân gây dị ứng.' },
        { id: 'part-brake', sku: 'VIN-BRAKE-PAD-F', name: 'Má phanh trước (Bộ)', price: 2100000, description: 'Bộ má phanh chính hãng.' },
        { id: 'part-wiper', sku: 'VIN-WIPER-BLADE', name: 'Lưỡi gạt mưa (Cặp)', price: 450000, description: 'Lưỡi gạt mưa silicone cao cấp.' },
    ];

    const createdParts = [];
    for (const part of partsData) {
        const newPart = await prisma.part.upsert({
            where: { id: part.id },
            update: { sku: part.sku, name: part.name, price: new Prisma.Decimal(part.price), description: part.description },
            create: { ...part, price: new Prisma.Decimal(part.price) },
        });
        createdParts.push(newPart);
    }
    console.log(` -> Đã tạo/cập nhật ${createdParts.length} phụ tùng.`);

    // Tạo kho hàng cho mỗi trung tâm
    for (const center of serviceCenters) {
        for (const part of createdParts) {
            // Dùng create để tránh lỗi unique constraint nếu chạy lại mà không clear
            await prisma.inventoryItem.create({
                data: {
                    partId: part.id,
                    serviceCenterId: center.id,
                    quantityInStock: faker.number.int({ min: 5, max: 50 }),
                    minStockLevel: 5,
                },
            });
        }
    }
    console.log(` -> Đã tạo kho hàng cho ${serviceCenters.length} trung tâm.`);
    return createdParts;
}

// Tạo lịch hẹn và các dữ liệu liên quan (cập nhật status và feedback)
async function seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter) {
    console.log(`Đang tạo lịch hẹn cho khách hàng: ${customer.email}`);
    const vehicles = await prisma.vehicle.findMany({ where: { ownerId: customer.id } });
    if (vehicles.length === 0) {
        console.log(` -> Khách hàng ${customer.email} chưa có xe, bỏ qua.`);
        return;
    }

    const createdAppointments = []; // Lưu lại để tạo feedback

    for (let i = 0; i < 2; i++) { // Tạo 2 lịch hẹn/khách
        const randomVehicle = faker.helpers.arrayElement(vehicles);
        const randomCenter = faker.helpers.arrayElement(serviceCenters);
        const servicesToBook = faker.helpers.arrayElements(serviceTypes, { min: 1, max: 3 });
        const appointmentStatus = faker.helpers.arrayElement([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED
        ]);

        let appointmentDate;
        if ([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointmentStatus)) {
            appointmentDate = faker.date.soon({ days: 30, refDate: new Date() }); // Chỉ định refDate
        } else {
            appointmentDate = faker.date.recent({ days: 60, refDate: new Date() });
        }
        appointmentDate.setHours(faker.helpers.arrayElement([9, 10, 11, 14, 15, 16]), 0, 0, 0);

        const appointmentInput = {
            appointmentDate: appointmentDate,
            status: appointmentStatus,
            customerNotes: faker.lorem.sentence(),
            customerId: customer.id,
            vehicleId: randomVehicle.id,
            serviceCenterId: randomCenter.id,
            requestedServices: {
                create: servicesToBook.map(service => ({
                    serviceTypeId: service.id,
                })),
            },
        };

        // Nếu lịch hẹn được xác nhận, đã hoàn thành hoặc đang thực hiện -> Tạo ServiceRecord
        if ([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.IN_PROGRESS].includes(appointmentStatus)) {
             const centerTechnicians = techniciansByCenter[randomCenter.id];
             if (centerTechnicians?.length > 0) {
                 const randomTechnician = faker.helpers.arrayElement(centerTechnicians);
                 const startTime = appointmentDate;
                 const endTime = appointmentStatus === AppointmentStatus.COMPLETED ? new Date(startTime.getTime() + faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000) : null;

                 // Map AppointmentStatus sang ServiceRecordStatus
                 let recordStatus;
                 switch(appointmentStatus) {
                     case AppointmentStatus.CONFIRMED: recordStatus = ServiceRecordStatus.PENDING; break; // Chờ KTV bắt đầu
                     case AppointmentStatus.IN_PROGRESS: recordStatus = ServiceRecordStatus.REPAIRING; break; // Giả sử đang sửa
                     case AppointmentStatus.COMPLETED: recordStatus = ServiceRecordStatus.COMPLETED; break;
                     default: recordStatus = ServiceRecordStatus.PENDING; // Mặc định
                 }

                 const serviceRecordInput = {
                     technicianId: randomTechnician.id,
                     status: recordStatus, // Sử dụng Enum
                     startTime: startTime,
                     endTime: endTime,
                     staffNotes: recordStatus === ServiceRecordStatus.COMPLETED ? 'Đã hoàn thành bảo dưỡng.' : 'Chờ xử lý.',
                 };

                 // Tạo dữ liệu chi tiết hơn cho lịch hẹn COMPLETED
                 if (appointmentStatus === AppointmentStatus.COMPLETED && recordStatus === ServiceRecordStatus.COMPLETED) {
                     const partsToUse = faker.helpers.arrayElements(parts, { min: 0, max: 2 });
                     if (partsToUse.length > 0) {
                         serviceRecordInput.partsUsed = {
                             create: partsToUse.map(part => ({
                                 partId: part.id,
                                 quantity: faker.number.int({ min: 1, max: 2 }),
                                 unitPrice: part.price,
                             })),
                         };
                     }

                     const estimatedCost = servicesToBook.length * 500000 + partsToUse.reduce((sum, p) => sum + Number(p.price) * (serviceRecordInput.partsUsed?.create.find(pu => pu.partId === p.id)?.quantity || 1), 0); // Tính tiền phụ tùng
                     serviceRecordInput.quotation = {
                         create: { estimatedCost: new Prisma.Decimal(estimatedCost) }
                     };

                     const totalAmount = estimatedCost * 1.08; // Giả lập VAT 8%
                     const invoiceStatus = faker.helpers.arrayElement([InvoiceStatus.PAID, InvoiceStatus.UNPAID]);
                     const invoiceInput = {
                         totalAmount: new Prisma.Decimal(totalAmount),
                         dueDate: faker.date.future({ years: 1, refDate: endTime ?? new Date() }), // Dùng endTime làm gốc
                         status: invoiceStatus,
                     };

                     if (invoiceStatus === InvoiceStatus.PAID) {
                         invoiceInput.payments = {
                             create: {
                                 paymentMethod: faker.helpers.arrayElement(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER']),
                                 status: PaymentStatus.SUCCESSFUL,
                                 paymentDate: endTime ?? new Date(),
                             }
                         };
                     }
                     serviceRecordInput.invoice = { create: invoiceInput };
                 }

                 appointmentInput.serviceRecord = { create: serviceRecordInput };
             } else {
                 console.warn(` -> Không tìm thấy KTV cho trung tâm ${randomCenter.name}.`);
             }
        }

        const createdAppt = await prisma.serviceAppointment.create({ data: appointmentInput });
        createdAppointments.push(createdAppt); // Lưu lại để tạo feedback
    }
    console.log(` -> Đã tạo ${createdAppointments.length} lịch hẹn cho ${customer.email}`);
    return createdAppointments; // Trả về danh sách lịch hẹn đã tạo
}

// --- HÀM CHÍNH ĐỂ SEED ---
async function main() {
    console.log('Bắt đầu quá trình seeding...');
    const password = await bcrypt.hash('123456', SALT_ROUNDS); // Dùng mật khẩu cố định cho dev

    // --- DỌN DẸP DỮ LIỆU CŨ ---
    console.log('Xóa dữ liệu cũ...');
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.partUsage.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.serviceRecord.deleteMany();
    await prisma.appointmentService.deleteMany();
    await prisma.serviceAppointment.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.part.deleteMany();
    await prisma.serviceType.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.technicianProfile.deleteMany();
    await prisma.staffCertification.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.servicePackage.deleteMany();
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO CÁC LOẠI DỊCH VỤ ---
    const serviceTypes = await seedServiceTypes();

    // --- TẠO TRUNG TÂM & NHÂN VIÊN ---
    const serviceCenters = [];
    const techniciansByCenter = {};

    for (let i = 0; i < 3; i++) {
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Quận ${i + 1}`,
                address: faker.location.streetAddress({ city: 'Hồ Chí Minh' }),
                phoneNumber: faker.phone.number('028#######'),
                openingTime: '08:00', closingTime: '17:00', slotDurationMinutes: 60, capacityPerSlot: faker.number.int({ min: 2, max: 4 }),
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);
        techniciansByCenter[center.id] = [];

        // Tạo Station Admin
        await prisma.user.create({
            data: {
                fullName: `Quản lý Trạm ${i + 1}`, email: `stationadmin${i + 1}@ev.com`, passwordHash: password, role: Role.STATION_ADMIN, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true,
            }
        });

        // Tạo Staff
        await prisma.user.create({
            data: {
                fullName: `Nhân viên ${faker.person.firstName()} (Q.${i + 1})`, email: `staff${i + 1}@ev.com`, passwordHash: password, role: Role.STAFF, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true,
            }
        });

        // Tạo Technicians
        for (let j = 0; j < 3; j++) {
            const tech = await prisma.user.create({
                data: {
                    fullName: `Kỹ thuật viên ${faker.person.firstName()} (Q.${i + 1})`, email: `tech${i + 1}_${j + 1}@ev.com`, passwordHash: password, role: Role.TECHNICIAN, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true,
                },
            });
            techniciansByCenter[center.id].push(tech);
        }
        console.log(` -> Đã tạo nhân sự cho ${center.name}`);
    }

    // --- TẠO PHỤ TÙNG VÀ KHO HÀNG ---
    const parts = await seedPartsAndInventory(serviceCenters);

    // --- TẠO TÀI KHOẢN CỐ ĐỊNH (GIỐNG PRODUCTION SEED) ---
    console.log('Đang tạo các tài khoản test cố định...');
    const center1Id = serviceCenters[0].id; // Lấy ID trung tâm đầu tiên

    // 1. Admin Test
    await prisma.user.upsert({
         where: { email: 'admin@evservice.com' }, update: {},
         create: { fullName: 'System Administrator', email: 'admin@evservice.com', passwordHash: await bcrypt.hash('admin123', SALT_ROUNDS), role: Role.ADMIN, phoneNumber: '0901112220' },
    });
    // 2. Station Admin Test (Q1)
    await prisma.user.upsert({
         where: { email: 'station@evservice.com' }, update: {},
         create: { fullName: 'Station Manager Q1', email: 'station@evservice.com', passwordHash: await bcrypt.hash('station123', SALT_ROUNDS), role: Role.STATION_ADMIN, serviceCenterId: center1Id, phoneNumber: '0901112221' },
    });
    // 3. Staff Test (Q1)
    await prisma.user.upsert({
         where: { email: 'staff@evservice.com' }, update: {},
         create: { fullName: 'Staff Test Q1', email: 'staff@evservice.com', passwordHash: await bcrypt.hash('staff123', SALT_ROUNDS), role: Role.STAFF, serviceCenterId: center1Id, phoneNumber: '0901112222' },
    });
    // 4. Technician Test (Q1)
    const techTest = await prisma.user.upsert({
         where: { email: 'tech@evservice.com' }, update: {},
         create: { fullName: 'Technician Test Q1', email: 'tech@evservice.com', passwordHash: await bcrypt.hash('tech123', SALT_ROUNDS), role: Role.TECHNICIAN, serviceCenterId: center1Id, phoneNumber: '0901112223' },
    });
     // Thêm KTV test vào danh sách KTV của trung tâm 1 nếu chưa có
    if (!techniciansByCenter[center1Id].find(t => t.email === techTest.email)) {
        techniciansByCenter[center1Id].push(techTest);
    }

    // 5. Customer Test
    const customerTest = await prisma.user.upsert({
         where: { email: 'customer@example.com' }, update: {},
         create: { fullName: 'Customer Example', email: 'customer@example.com', passwordHash: await bcrypt.hash('customer123', SALT_ROUNDS), role: Role.CUSTOMER, phoneNumber: '0901112224', address: '123 Example St, Q1' },
    });
    // Tạo xe cho Customer Test
    await prisma.vehicle.upsert({ where: { vin: 'VF8TESTVIN00001' }, update: {}, create: { make: 'VinFast', model: 'VF8', year: 2023, vin: 'VF8TESTVIN00001', licensePlate: '51K-TEST1', ownerId: customerTest.id, currentMileage: 15000 } });
    await prisma.vehicle.upsert({ where: { vin: 'VFE34TESTVIN002' }, update: {}, create: { make: 'VinFast', model: 'VF e34', year: 2022, vin: 'VFE34TESTVIN002', licensePlate: '51K-TEST2', ownerId: customerTest.id, currentMileage: 42000 } });

    console.log(' -> Đã tạo/cập nhật xong tài khoản test.');

    // --- TẠO KHÁCH HÀNG FAKE KHÁC & XE ---
    const customers = [customerTest]; // Bắt đầu với customer test
    for (let i = 0; i < 5; i++) { // Tạo thêm 5 khách fake
        const customer = await prisma.user.create({
            data: {
                fullName: faker.person.fullName(), email: faker.internet.email().toLowerCase(), passwordHash: password, role: Role.CUSTOMER, phoneNumber: faker.phone.number('09########'), address: faker.location.streetAddress({ city: 'Hồ Chí Minh' }),
            },
        });
        customers.push(customer);

        const numberOfVehicles = faker.number.int({ min: 1, max: 2 });
        for (let j = 0; j < numberOfVehicles; j++) {
            await prisma.vehicle.create({
                data: {
                    make: 'VinFast', model: faker.helpers.arrayElement(['VF8', 'VF9', 'VF e34', 'VF7', 'VF6']), year: faker.number.int({ min: 2021, max: 2024 }), vin: faker.vehicle.vin(), licensePlate: faker.vehicle.vrm(), ownerId: customer.id, currentMileage: faker.number.int({ min: 500, max: 100000 }),
                },
            });
        }
    }
    console.log(`Đã tạo tổng cộng ${customers.length} khách hàng và xe.`);

    // --- TẠO LỊCH HẸN & FEEDBACK ---
    let allCreatedAppointments = [];
    for (const customer of customers) {
        const created = await seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter);
        allCreatedAppointments = allCreatedAppointments.concat(created);
    }

    // Tạo Feedback ngẫu nhiên cho các lịch hẹn COMPLETED
    console.log('Đang tạo feedback ngẫu nhiên...');
    const completedAppointments = allCreatedAppointments.filter(a => a.status === AppointmentStatus.COMPLETED);
    let feedbackCount = 0;
    for (const app of completedAppointments) {
        if (faker.datatype.boolean(0.6)) { // 60% cơ hội có feedback
            await prisma.feedback.create({
                data: {
                    customerId: app.customerId,
                    appointmentId: app.id, // Sử dụng ID lịch hẹn đã tạo
                    rating: faker.number.int({ min: 3, max: 5 }),
                    content: faker.lorem.paragraph(2), // Feedback ngắn gọn hơn
                }
            });
            feedbackCount++;
        }
    }
    console.log(` -> Đã tạo ${feedbackCount} feedback.`);

    console.log('\n🎉 Hoàn tất quá trình seeding!');
    console.log('\n📋 Thông tin đăng nhập test: (Mật khẩu: 123456 hoặc mật khẩu riêng nếu có)');
    console.log('👤 Admin: admin@evservice.com / admin123');
    console.log('👨‍💼 Station Admin: station@evservice.com / station123');
    console.log('👨‍🔧 Staff: staff@evservice.com / staff123');
    console.log('🔧 Technician: tech@evservice.com / tech123');
    console.log('👤 Customer: customer@example.com / customer123');

}

main()
    .catch((e) => {
        console.error('Lỗi trong quá trình seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });