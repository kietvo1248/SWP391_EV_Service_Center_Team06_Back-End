// Tệp: prisma/seed.js

const { PrismaClient, Prisma, Role, AppointmentStatus, ServiceRecordStatus, InvoiceStatus, PaymentStatus } = require('@prisma/client');
const { faker } = require('@faker-js/faker/locale/vi');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// --- HÀM TẠO DỮ LIỆU PHỤ TRỢ ---

// (Hàm này đã có, giữ nguyên)
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

// (Hàm này đã có, giữ nguyên - Đảm bảo có kho phụ tùng)
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

    for (const center of serviceCenters) {
        for (const part of createdParts) {
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

// (Hàm này đã có, giữ nguyên)
async function seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter) {
    // ... (Giữ nguyên logic tạo lịch hẹn phức tạp)
    console.log(`Đang tạo lịch hẹn cho khách hàng: ${customer.email}`);
    const vehicles = await prisma.vehicle.findMany({ where: { ownerId: customer.id } });
    if (vehicles.length === 0) {
        console.log(` -> Khách hàng ${customer.email} chưa có xe, bỏ qua.`);
        return;
    }

    const createdAppointments = [];
    for (let i = 0; i < 2; i++) { 
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
            appointmentDate = faker.date.soon({ days: 30, refDate: new Date() });
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

        if ([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.PENDING_APPROVAL].includes(appointmentStatus)) {
             const centerTechnicians = techniciansByCenter[randomCenter.id];
             if (centerTechnicians?.length > 0) {
                 const randomTechnician = faker.helpers.arrayElement(centerTechnicians);
                 const startTime = appointmentDate;
                 const endTime = appointmentStatus === AppointmentStatus.COMPLETED ? new Date(startTime.getTime() + faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000) : null;

                 let recordStatus;
                 switch(appointmentStatus) {
                     case AppointmentStatus.CONFIRMED: recordStatus = ServiceRecordStatus.PENDING; break;
                     case AppointmentStatus.IN_PROGRESS: recordStatus = ServiceRecordStatus.REPAIRING; break;
                     case AppointmentStatus.COMPLETED: recordStatus = ServiceRecordStatus.COMPLETED; break;
                     case AppointmentStatus.PENDING_APPROVAL: recordStatus = ServiceRecordStatus.WAITING_APPROVAL; break;
                     default: recordStatus = ServiceRecordStatus.PENDING;
                 }

                 const serviceRecordInput = {
                     technicianId: randomTechnician.id,
                     status: recordStatus,
                     startTime: startTime,
                     endTime: endTime,
                     staffNotes: recordStatus === ServiceRecordStatus.COMPLETED ? 'Đã hoàn thành bảo dưỡng.' : 'Chờ xử lý.',
                 };

                 if (appointmentStatus === AppointmentStatus.COMPLETED) {
                     // ... (Logic tạo PartUsage, Quotation, Invoice, Payment) ...
                 }
                 appointmentInput.serviceRecord = { create: serviceRecordInput };
             }
        }

        const createdAppt = await prisma.serviceAppointment.create({ data: appointmentInput });
        createdAppointments.push(createdAppt);
    }
    console.log(` -> Đã tạo ${createdAppointments.length} lịch hẹn cho ${customer.email}`);
    return createdAppointments;
}

// --- HÀM MỚI: Tạo chứng chỉ (cho profile) ---
async function seedCertifications() {
    console.log('Đang tạo chứng chỉ mẫu...');
    const certs = [
        { id: 'cert-vin-basic', name: 'Chứng chỉ Bảo dưỡng VinFast Cơ bản', issuingOrganization: 'VinFast Academy' },
        { id: 'cert-vin-hv', name: 'Chứng chỉ Hệ thống Pin Cao Áp (HV)', issuingOrganization: 'VinFast Academy' },
        { id: 'cert-diag', name: 'Chuyên gia Chẩn đoán Lỗi Điện', issuingOrganization: 'Trường ĐH Bách Khoa' },
    ];
    for (const cert of certs) {
        await prisma.certification.upsert({
            where: { id: cert.id },
            update: {},
            create: cert,
        });
    }
    console.log(' -> Đã tạo chứng chỉ.');
    return prisma.certification.findMany();
}


// --- HÀM MAIN ---
async function main() {
    console.log('Bắt đầu quá trình seeding...');
    const password = await bcrypt.hash('123456', SALT_ROUNDS); // Dùng mật khẩu cố định cho dev

    // --- DỌN DẸP DỮ LIỆU CŨ ---
    // (Giữ nguyên logic dọn dẹp đầy đủ của bạn)
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
    await prisma.technicianProfile.deleteMany(); // Đảm bảo dọn dẹp profile
    await prisma.staffCertification.deleteMany(); // Đảm bảo dọn dẹp liên kết
    await prisma.certification.deleteMany(); // Đảm bảo dọn dẹp chứng chỉ
    await prisma.message.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.servicePackage.deleteMany();
    await prisma.restockRequest.deleteMany(); // Đảm bảo dọn dẹp yêu cầu kho
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO DỮ LIỆU CHUNG ---
    const serviceTypes = await seedServiceTypes();
    const certifications = await seedCertifications(); // Tạo chứng chỉ

    // --- TẠO TRUNG TÂM & NHÂN VIÊN (FAKE) ---
    const serviceCenters = [];
    const techniciansByCenter = {};

    for (let i = 0; i < 3; i++) {
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Quận ${i + 7}`, // Đổi thành Q7, Q8, Q9 để tránh trùng test
                address: faker.location.streetAddress({ city: 'Hồ Chí Minh' }),
                phoneNumber: faker.phone.number('028#######'),
                openingTime: '08:00', closingTime: '17:00', slotDurationMinutes: 60, capacityPerSlot: faker.number.int({ min: 2, max: 4 }),
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);
        techniciansByCenter[center.id] = [];

        // Tạo Station Admin (Fake)
        await prisma.user.create({
            data: {
                fullName: `Quản lý Trạm (Fake) ${i + 7}`, email: `stationadmin_fake${i + 7}@ev.com`, passwordHash: password, role: Role.STATION_ADMIN, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, userCode: `SA${i+7}`
            }
        });

        // Tạo Staff (Fake)
        await prisma.user.create({
            data: {
                fullName: `Nhân viên (Fake) ${faker.person.firstName()}`, email: `staff_fake${i + 7}@ev.com`, passwordHash: password, role: Role.STAFF, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, userCode: `STF${i+7}`
            }
        });
        
        // Tạo Technicians (Fake)
        for (let j = 0; j < 2; j++) {
            const tech = await prisma.user.create({
                data: {
                    fullName: `Kỹ thuật viên (Fake) ${faker.person.firstName()}`, email: `tech_fake${i+7}_${j+1}@ev.com`, passwordHash: password, role: Role.TECHNICIAN, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, userCode: `TEC${i+7}${j+1}`
                },
            });
            // Tạo profile cơ bản cho KTV fake
            await prisma.technicianProfile.create({
                data: { userId: tech.id, specialization: 'Bảo dưỡng chung' }
            });
            techniciansByCenter[center.id].push(tech);
        }
        console.log(` -> Đã tạo nhân sự (Fake) cho ${center.name}`);
    }

    // --- TẠO PHỤ TÙNG VÀ KHO HÀNG ---
    const parts = await seedPartsAndInventory(serviceCenters);

    // --- TẠO CÁC TÀI KHOẢN CỐ ĐỊNH ĐỂ TEST ---
    console.log('Đang tạo các tài khoản test cố định...');
    
    // Tạo 1 trung tâm cố định cho tài khoản test
    const testCenter = await prisma.serviceCenter.create({
        data: {
            name: 'VinFast Service Quận 1 (Test)',
            address: '123 Đồng Khởi, P. Bến Nghé, Quận 1',
            phoneNumber: '0281112222',
            openingTime: '08:00', closingTime: '17:00', slotDurationMinutes: 60, capacityPerSlot: 3,
        },
    });
    console.log(`Đã tạo trung tâm test: ${testCenter.name}`);
    // Thêm trung tâm test vào danh sách chung
    serviceCenters.push(testCenter); 
    techniciansByCenter[testCenter.id] = [];
    // Tạo kho hàng cho trung tâm test
    await seedPartsAndInventory([testCenter]);


    // 1. ADMIN CỨNG
    await prisma.user.upsert({
         where: { email: 'admin@evservice.com' }, update: {},
         create: { fullName: 'Admin Tổng (Hardcoded)', email: 'admin@evservice.com', passwordHash: await bcrypt.hash('admin123', SALT_ROUNDS), role: Role.ADMIN, phoneNumber: '0901112220', userCode: 'ADMIN001', isActive: true },
    });
    // 2. STATION_ADMIN CỨNG (Quản lý Q1)
    const stationAdminTest = await prisma.user.upsert({
         where: { email: 'station@evservice.com' }, update: {},
         create: { fullName: 'Quản lý Trạm Q1 (Hardcoded)', email: 'station@evservice.com', passwordHash: await bcrypt.hash('station123', SALT_ROUNDS), role: Role.STATION_ADMIN, serviceCenterId: testCenter.id, phoneNumber: '0901112221', userCode: 'SA001', isActive: true },
    });
    // 3. STAFF CỨNG (Nhân viên Q1)
    const staffTest = await prisma.user.upsert({
         where: { email: 'staff@evservice.com' }, update: {},
         create: { fullName: 'Nhân viên Q1 (Hardcoded)', email: 'staff@evservice.com', passwordHash: await bcrypt.hash('staff123', SALT_ROUNDS), role: Role.STAFF, serviceCenterId: testCenter.id, phoneNumber: '0901112222', userCode: 'STF001', isActive: true },
    });
    // 4. TECHNICIAN CỨNG (Kỹ thuật viên Q1)
    const techTest = await prisma.user.upsert({
         where: { email: 'tech@evservice.com' }, update: {},
         create: { fullName: 'Kỹ thuật viên Q1 (Hardcoded)', email: 'tech@evservice.com', passwordHash: await bcrypt.hash('tech123', SALT_ROUNDS), role: Role.TECHNICIAN, serviceCenterId: testCenter.id, phoneNumber: '0901112223', userCode: 'TEC001', isActive: true },
    });
    techniciansByCenter[testCenter.id].push(techTest);
    // Tạo profile và gán chứng chỉ cho KTV cứng
    await prisma.technicianProfile.upsert({
        where: { userId: techTest.id },
        update: {},
        create: { userId: techTest.id, specialization: 'Hệ thống Pin Cao Áp (HV)' }
    });
    await prisma.staffCertification.create({
        data: { staffId: techTest.id, certificationId: 'cert-vin-hv' } // Gán chứng chỉ HV
    });

    // 5. CUSTOMER CỨNG
    const customerTest = await prisma.user.upsert({
         where: { email: 'customer@example.com' }, update: {},
         create: { fullName: 'Khách hàng Test (Hardcoded)', email: 'customer@example.com', passwordHash: await bcrypt.hash('customer123', SALT_ROUNDS), role: Role.CUSTOMER, phoneNumber: '0901112224', address: '123 Example St, Q1', userCode: 'CUS001', isActive: true },
    });
    // Tạo xe cho Customer cứng
    await prisma.vehicle.upsert({ where: { vin: 'VF8TESTVIN00001' }, update: {}, create: { make: 'VinFast', model: 'VF8', year: 2023, vin: 'VF8TESTVIN00001', licensePlate: '51K-TEST1', ownerId: customerTest.id, currentMileage: 15000 } });
    await prisma.vehicle.upsert({ where: { vin: 'VFE34TESTVIN002' }, update: {}, create: { make: 'VinFast', model: 'VF e34', year: 2022, vin: 'VFE34TESTVIN002', licensePlate: '51K-TEST2', ownerId: customerTest.id, currentMileage: 42000 } });

    // 6. INVENTORY_MANAGER CỨNG (Quản lý kho Q1)
    const inventoryManagerTest = await prisma.user.upsert({
         where: { email: 'inventory@evservice.com' }, update: {},
         create: { fullName: 'Quản lý Kho Q1 (Hardcoded)', email: 'inventory@evservice.com', passwordHash: await bcrypt.hash('inventory123', SALT_ROUNDS), role: Role.INVENTORY_MANAGER, serviceCenterId: testCenter.id, phoneNumber: '0901112225', userCode: 'IM001', isActive: true },
    });

    console.log(' -> Đã tạo/cập nhật xong 6 tài khoản test cố định.');
    
    // --- TẠO KHÁCH HÀNG FAKE KHÁC & XE ---
    const customers = [customerTest]; // Bắt đầu với customer test
    for (let i = 0; i < 5; i++) { // Tạo thêm 5 khách fake
        const customer = await prisma.user.create({
            data: {
                fullName: faker.person.fullName(), email: faker.internet.email().toLowerCase(), passwordHash: password, role: Role.CUSTOMER, phoneNumber: faker.phone.number('09########'), address: faker.location.streetAddress({ city: 'Hồ Chí Minh' }), isActive: true, userCode: `CUS${i+100}`
            },
        });
        customers.push(customer);
        // (Logic tạo xe cho khách fake giữ nguyên)
        const numberOfVehicles = faker.number.int({ min: 1, max: 2 });
        for (let j = 0; j < numberOfVehicles; j++) {
            await prisma.vehicle.create({
                data: {
                    make: 'VinFast',
                    model: faker.helpers.arrayElement(['VF8', 'VF9', 'VF e34', 'VF7', 'VF6']),
                    year: faker.number.int({ min: 2021, max: 2024 }),
                    vin: faker.vehicle.vin(),
                    licensePlate: faker.vehicle.vrm(),
                    ownerId: customer.id,
                    currentMileage: faker.number.int({ min: 500, max: 100000 }),
                },
            });
        }
    }
    console.log(`Đã tạo tổng cộng ${customers.length} khách hàng và xe của họ.`);

    // --- TẠO LỊCH HẸN & FEEDBACK ---
    let allCreatedAppointments = [];
    for (const customer of customers) {
        const created = await seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter);
        allCreatedAppointments = allCreatedAppointments.concat(created);
    }

    // (Logic tạo Feedback giữ nguyên)
    console.log('Đang tạo feedback ngẫu nhiên...');
    const completedAppointments = allCreatedAppointments.filter(a => a.status === AppointmentStatus.COMPLETED);
    let feedbackCount = 0;
    for (const app of completedAppointments) {
        if (faker.datatype.boolean(0.6)) { 
            await prisma.feedback.create({
                data: {
                    customerId: app.customerId,
                    appointmentId: app.id, 
                    rating: faker.number.int({ min: 3, max: 5 }),
                    content: faker.lorem.paragraph(2),
                }
            });
            feedbackCount++;
        }
    }
    console.log(` -> Đã tạo ${feedbackCount} feedback.`);

    console.log('\n🎉 Hoàn tất quá trình seeding!');
    console.log('\n📋 Thông tin đăng nhập test:');
    console.log(`  Mật khẩu chung (fake): 123456`);
    console.log(`  --- Tài khoản cố định (tại ${testCenter.name}) ---`);
    console.log('  👤 Admin:         admin@evservice.com     (pass: admin123)');
    console.log('  👨‍💼 Station Admin: station@evservice.com   (pass: station123)');
    console.log('  👨‍🔧 Staff:         staff@evservice.com       (pass: staff123)');
    console.log('  🔧 Technician:    tech@evservice.com        (pass: tech123)');
    console.log('  📦 Inventory Mgr: inventory@evservice.com   (pass: inventory123)');
    console.log('  👤 Customer:      customer@example.com      (pass: customer123)');

}

main()
    .catch((e) => {
        console.error('Lỗi trong quá trình seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });