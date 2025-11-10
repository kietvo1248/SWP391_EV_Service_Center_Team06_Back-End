// Tệp: prisma/seed.js

const { PrismaClient, Prisma, Role, AppointmentStatus, ServiceRecordStatus, InvoiceStatus, PaymentStatus, RestockRequestStatus, PartUsageStatus } = require('@prisma/client');
const { Faker, vi, en } = require('@faker-js/faker'); 
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const faker = new Faker({ locale: [vi, en] });

// --- HÀM TẠO DỮ LIỆU PHỤ TRỢ ---

// (Hàm này giữ nguyên)
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

// (Hàm này giữ nguyên)
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

// (Hàm này giữ nguyên)
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

// (HÀM MỚI) Tạo Dòng xe (Model) và Loại pin (Battery)
async function seedModelsAndBatteries() {
    console.log('Đang tạo Dòng xe và Loại pin...');
    
    // 1. Tạo các loại pin
    const battery90 = await prisma.batteryType.upsert({
        where: { name: 'Pin LFP 90kWh (Thuê)' },
        update: {},
        create: {  name: 'Pin LFP 90kWh (Thuê)', capacityKwh: 90 },
    });
    const battery100 = await prisma.batteryType.upsert({
        where: { name: 'Pin NMC 100kWh (Sở hữu)' },
        update: {},
        create: {  name: 'Pin NMC 100kWh (Sở hữu)', capacityKwh: 100 },
    });
    const battery77 = await prisma.batteryType.upsert({
        where: { name: 'Pin LFP 77kWh (VF e34)' },
        update: {},
        create: { name: 'Pin LFP 77kWh (VF e34)', capacityKwh: 77 },
    });
    console.log(' -> Đã tạo 3 loại pin.');

    // 2. Tạo các dòng xe và liên kết pin tương thích
    const modelVF8 = await prisma.vehicleModel.create({
        data: {
            brand: 'VinFast',
            name: 'VF8',
            compatibleBatteries: {
                connect: [{ id: battery90.id }, { id: battery100.id }] 
            }
        },
    });

    const modelVFe34 = await prisma.vehicleModel.create({
        data: {
            brand: 'VinFast',
            name: 'VF e34',
            compatibleBatteries: {
                connect: [{ id: battery77.id }]
            }
        },
    });
    console.log(' -> Đã tạo 2 dòng xe và liên kết pin.');

    // Trả về tất cả model và pin để sử dụng sau này
    return {
        models: await prisma.vehicleModel.findMany({ include: { compatibleBatteries: true } }),
        batteries: [battery90, battery100, battery77]
    };
}


// (Hàm này đã CẬP NHẬT)
async function seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter) {
    console.log(`Đang tạo lịch hẹn cho khách hàng: ${customer.email}`);
    // Chỉ lấy xe CHƯA XÓA
    const vehicles = await prisma.vehicle.findMany({ 
        where: { ownerId: customer.id, isDeleted: false } 
    });
    if (vehicles.length === 0) return [];

    const createdAppointments = [];
    
    // (Logic tạo lịch hẹn, service record, invoice... giữ nguyên như file của bạn)
    // ... (Giữ nguyên toàn bộ logic for-loop của bạn ở đây) ...
    // (Không lặp lại code ở đây để giữ cho câu trả lời ngắn gọn)
    // ...
    // --- (Logic tạo lịch hẹn của bạn bắt đầu) ---
    const statusesToSeed = [
        AppointmentStatus.PENDING,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.PENDING_APPROVAL,
    ];
    
    for (const appointmentStatus of statusesToSeed) {
        const randomVehicle = faker.helpers.arrayElement(vehicles);
        const randomCenter = faker.helpers.arrayElement(serviceCenters);
        const servicesToBook = faker.helpers.arrayElements(serviceTypes, { min: 1, max: 2 });

        let appointmentDate;
        if (appointmentStatus === AppointmentStatus.PENDING) {
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

        const centerTechnicians = techniciansByCenter[randomCenter.id];
        if (appointmentStatus !== AppointmentStatus.PENDING && centerTechnicians?.length > 0) {
            const randomTechnician = faker.helpers.arrayElement(centerTechnicians);
            const startTime = appointmentDate;
            const endTime = appointmentStatus === AppointmentStatus.COMPLETED ? new Date(startTime.getTime() + faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000) : null;

            let recordStatus;
            switch(appointmentStatus) {
                // (Sửa nhỏ): Thêm các trạng thái còn thiếu nếu cần
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
                staffNotes: 'Ghi chú chẩn đoán/sửa chữa mẫu.',
            };

            const partsToUse = faker.helpers.arrayElements(parts, { min: 1, max: 2 });
            const partsCost = partsToUse.reduce((sum, p) => sum + Number(p.price), 0);
            const estimatedCost = servicesToBook.length * 500000 + partsCost;

            if (appointmentStatus === AppointmentStatus.COMPLETED) {
                serviceRecordInput.partsUsed = {
                    create: partsToUse.map(part => ({
                        partId: part.id,
                        quantity: 1,
                        unitPrice: part.price,
                        status: PartUsageStatus.ISSUED 
                    })),
                };
                serviceRecordInput.quotation = {
                    create: { estimatedCost: new Prisma.Decimal(estimatedCost) }
                };
                serviceRecordInput.invoice = {
                    create: {
                        totalAmount: new Prisma.Decimal(estimatedCost * 1.08), 
                        status: InvoiceStatus.PAID,
                        dueDate: new Date(),
                        payments: {
                            create: {
                                paymentMethod: 'CASH',
                                status: PaymentStatus.SUCCESSFUL,
                                paymentDate: endTime ?? new Date(),
                            }
                        }
                    }
                };
            } 
            else if (appointmentStatus === AppointmentStatus.PENDING_APPROVAL) {
                 serviceRecordInput.partsUsed = {
                    create: partsToUse.map(part => ({
                        partId: part.id,
                        quantity: 1,
                        unitPrice: part.price,
                        status: PartUsageStatus.REQUESTED 
                    })),
                };
                serviceRecordInput.quotation = {
                    create: { estimatedCost: new Prisma.Decimal(estimatedCost) }
                };
            }

            appointmentInput.serviceRecord = { create: serviceRecordInput };
        }

        const createdAppt = await prisma.serviceAppointment.create({ data: appointmentInput });
        createdAppointments.push(createdAppt);
    }
    // --- (Logic tạo lịch hẹn của bạn kết thúc) ---

    console.log(` -> Đã tạo ${createdAppointments.length} lịch hẹn cho ${customer.email}`);
    return createdAppointments;
}

// (Hàm này giữ nguyên)
async function seedMaintenanceRecommendations(serviceTypes) {
    console.log('Đang tạo gợi ý bảo dưỡng (MaintenanceRecommendations)...');
    
    const bdDinhKy = serviceTypes.find(s => s.name.includes('định kỳ'))?.id;
    const kiemTraPin = serviceTypes.find(s => s.name.includes('Pin'))?.id;
    const heThongPhanh = serviceTypes.find(s => s.name.includes('Phanh'))?.id;
    const dieuHoa = serviceTypes.find(s => s.name.includes('Điều hòa'))?.id;

    const recommendations = [];

    if (bdDinhKy) recommendations.push({ model: 'ALL', mileageMilestone: 5000, serviceTypeId: bdDinhKy });
    if (bdDinhKy) recommendations.push({ model: 'ALL', mileageMilestone: 10000, serviceTypeId: bdDinhKy });
    if (dieuHoa) recommendations.push({ model: 'ALL', mileageMilestone: 10000, serviceTypeId: dieuHoa }); 
    if (bdDinhKy) recommendations.push({ model: 'VF8', mileageMilestone: 20000, serviceTypeId: bdDinhKy });
    if (kiemTraPin) recommendations.push({ model: 'VF8', mileageMilestone: 20000, serviceTypeId: kiemTraPin });
    if (heThongPhanh) recommendations.push({ model: 'VF8', mileageMilestone: 20000, serviceTypeId: heThongPhanh });
    if (bdDinhKy) recommendations.push({ model: 'VF e34', mileageMilestone: 20000, serviceTypeId: bdDinhKy });

    if (recommendations.length > 0) {
        await prisma.maintenanceRecommendation.createMany({
            data: recommendations,
            skipDuplicates: true,
        });
    }
    console.log(` -> Đã tạo ${recommendations.length} gợi ý bảo dưỡng.`);
}

// --- HÀM MAIN (ĐÃ CẬP NHẬT) ---
async function main() {
    console.log('Bắt đầu quá trình seeding...');
    const password = await bcrypt.hash('123456', SALT_ROUNDS); 

    // --- DỌN DẸP DỮ LIỆU CŨ (CẬP NHẬT THỨ TỰ) ---
    console.log('Xóa dữ liệu cũ (Tất cả các bảng)...');
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.partUsage.deleteMany();
    await prisma.restockRequest.deleteMany(); 
    await prisma.feedback.deleteMany();
    await prisma.serviceRecord.deleteMany();
    await prisma.appointmentService.deleteMany();
    await prisma.serviceAppointment.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.part.deleteMany();
    await prisma.maintenanceRecommendation.deleteMany();
    await prisma.serviceType.deleteMany();
    
    await prisma.vehicle.deleteMany(); // Phải xóa xe TRƯỚC khi xóa Model và Pin
    
    // Xóa liên kết nhiều-nhiều của Pin và Model trước
    //await prisma.vehicleModel.updateMany({ data: { compatibleBatteries: { set: [] } } }); // super bug

    await prisma.batteryType.deleteMany(); // (MỚI)
    await prisma.vehicleModel.deleteMany(); // (MỚI)

    await prisma.servicePackage.deleteMany(); 
    await prisma.message.deleteMany(); 
    await prisma.notification.deleteMany(); 
    await prisma.report.deleteMany(); 
    await prisma.technicianProfile.deleteMany(); 
    await prisma.staffCertification.deleteMany(); 
    await prisma.certification.deleteMany(); 
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO DỮ LIỆU CHUNG ---
    const serviceTypes = await seedServiceTypes();
    const certifications = await seedCertifications();
    const { models, batteries } = await seedModelsAndBatteries(); // (MỚI)
    const modelVF8 = models.find(m => m.name === 'VF8');
    const modelVFe34 = models.find(m => m.name === 'VF e34');

    // --- TẠO TRUNG TÂM & NHÂN VIÊN (FAKE) ---
    // (Logic này giữ nguyên, không cần thay đổi)
    const serviceCenters = [];
    const techniciansByCenter = {};
    const inventoryManagers = []; 
    const stationAdmins = []; 

    for (let i = 0; i < 2; i++) { 
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Quận ${i + 7}`,
                address: faker.location.streetAddress(true), 
                phoneNumber: faker.phone.number('028#######'),
                openingTime: '08:00', closingTime: '17:00', slotDurationMinutes: 60, capacityPerSlot: 2,
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);
        techniciansByCenter[center.id] = [];

        const sa = await prisma.user.create({
            data: {
                fullName: `Quản lý Trạm (Fake) ${i + 7}`, email: `stationadmin_fake${i + 7}@ev.com`, passwordHash: password, role: Role.STATION_ADMIN, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, 
                employeeCode: `SA${(i+7).toString().padStart(3, '0')}` 
            }
        });
        stationAdmins.push(sa);

        await prisma.user.create({
            data: {
                fullName: `Nhân viên (Fake) ${faker.person.firstName()}`, email: `staff_fake${i + 7}@ev.com`, passwordHash: password, role: Role.STAFF, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, 
                employeeCode: `STF${(i+7).toString().padStart(3, '0')}` 
            }
        });

        const im = await prisma.user.create({
            data: {
                fullName: `Quản lý Kho (Fake) ${faker.person.firstName()}`, email: `inventory_fake${i + 7}@ev.com`, passwordHash: password, role: Role.INVENTORY_MANAGER, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, 
                employeeCode: `IM${(i+7).toString().padStart(3, '0')}` 
            }
        });
        inventoryManagers.push(im);
        
        for (let j = 0; j < 2; j++) {
            const tech = await prisma.user.create({
                data: {
                    fullName: `Kỹ thuật viên (Fake) ${faker.person.firstName()}`, email: `tech_fake${i+7}_${j+1}@ev.com`, passwordHash: password, role: Role.TECHNICIAN, serviceCenterId: center.id, phoneNumber: faker.phone.number('09########'), isActive: true, 
                    employeeCode: `TEC${(i+7).toString().padStart(3, '0')}${j+1}`
                },
            });
            await prisma.technicianProfile.create({
                data: { userId: tech.id, specialization: 'Bảo dưỡng chung' }
            });
            
            await prisma.staffCertification.create({
                data: { 
                    staffId: tech.id, 
                    certificationId: certifications[0].id, 
                    certificateNumber: `FAKE-${faker.string.alphanumeric(10)}`
                }
            });

            techniciansByCenter[center.id].push(tech);
        }
        console.log(` -> Đã tạo nhân sự (Fake) cho ${center.name}`);
    }

    // --- TẠO PHỤ TÙNG VÀ KHO HÀNG ---
    const parts = await seedPartsAndInventory(serviceCenters);

    // --- TẠO CÁC TÀI KHOẢN CỐ ĐỊNH ĐỂ TEST (CẬP NHẬT) ---
    console.log('Đang tạo các tài khoản test cố định...');
    const testCenter = await prisma.serviceCenter.create({
        data: { name: 'VinFast Service Quận 1 (Test)', address: '123 Đồng Khởi, P. Bến Nghé, Quận 1', phoneNumber: '0281112222', capacityPerSlot: 3, },
    });
    console.log(`Đã tạo trung tâm test: ${testCenter.name}`);
    serviceCenters.push(testCenter); 
    techniciansByCenter[testCenter.id] = [];
    await seedPartsAndInventory([testCenter]); 

    // (Tạo 6 tài khoản cứng: Admin, StationAdmin, Staff, Tech, IM, Customer giữ nguyên)
    // 1. ADMIN CỨNG
    const adminTest = await prisma.user.upsert({
         where: { email: 'admin@evservice.com' }, update: { employeeCode: 'ADMIN001' },
         create: { fullName: 'Admin Tổng (Hardcoded)', email: 'admin@evservice.com', passwordHash: await bcrypt.hash('admin123', SALT_ROUNDS), role: Role.ADMIN, phoneNumber: '0901112220', 
                   employeeCode: 'ADMIN001', isActive: true },
    });
    // 2. STATION_ADMIN CỨNG (Quản lý Q1)
    const stationAdminTest = await prisma.user.upsert({
         where: { email: 'station@evservice.com' }, update: { employeeCode: 'SA001' },
         create: { fullName: 'Quản lý Trạm Q1 (Hardcoded)', email: 'station@evservice.com', passwordHash: await bcrypt.hash('station123', SALT_ROUNDS), role: Role.STATION_ADMIN, serviceCenterId: testCenter.id, phoneNumber: '0901112221', 
                   employeeCode: 'SA001', isActive: true },
    });
    stationAdmins.push(stationAdminTest); 
    // 3. STAFF CỨNG (Nhân viên Q1)
    const staffTest = await prisma.user.upsert({
         where: { email: 'staff@evservice.com' }, update: { employeeCode: 'STF001' },
         create: { fullName: 'Nhân viên Q1 (Hardcoded)', email: 'staff@evservice.com', passwordHash: await bcrypt.hash('staff123', SALT_ROUNDS), role: Role.STAFF, serviceCenterId: testCenter.id, phoneNumber: '0901112222', 
                   employeeCode: 'STF001', isActive: true },
    });
    // 4. TECHNICIAN CỨNG (Kỹ thuật viên Q1)
    const techTest = await prisma.user.upsert({
         where: { email: 'tech@evservice.com' }, update: { employeeCode: 'TEC001' },
         create: { fullName: 'Kỹ thuật viên Q1 (Hardcoded)', email: 'tech@evservice.com', passwordHash: await bcrypt.hash('tech123', SALT_ROUNDS), role: Role.TECHNICIAN, serviceCenterId: testCenter.id, phoneNumber: '0901112223', 
                   employeeCode: 'TEC001', isActive: true },
    });
    techniciansByCenter[testCenter.id].push(techTest);
    await prisma.technicianProfile.upsert({
        where: { userId: techTest.id }, update: {},
        create: { userId: techTest.id, specialization: 'Hệ thống Pin Cao Áp (HV)' }
    });
    await prisma.staffCertification.upsert({
        where: { staffId_certificationId: { staffId: techTest.id, certificationId: certifications[1].id } },
        update: { certificateNumber: `HARDCODED-${faker.string.alphanumeric(10)}` },
        create: { 
            staffId: techTest.id, 
            certificationId: certifications[1].id, 
            certificateNumber: `HARDCODED-${faker.string.alphanumeric(10)}`
        }
    });

    // 5. CUSTOMER CỨNG
    const customerTest = await prisma.user.upsert({
         where: { email: 'customer@example.com' }, update: {},
         create: { fullName: 'Khách hàng Test (Hardcoded)', email: 'customer@example.com', passwordHash: await bcrypt.hash('customer123', SALT_ROUNDS), role: Role.CUSTOMER, phoneNumber: '0901112224', address: '123 Example St, Q1', 
                   employeeCode: null, isActive: true }, 
    });
    
    // --- (CẬP NHẬT TẠO XE CỨNG) ---
    await prisma.vehicle.upsert({ 
        where: { vin: 'VF8TESTVIN00001' }, 
        update: { color: 'Đen' }, 
        create: { 
            // brand: 'VinFast', model: 'VF8', // (Xóa 2 trường này)
            vehicleModelId: modelVF8.id, // (THAY THẾ)
            year: 2023, 
            vin: 'VF8TESTVIN00001', 
            licensePlate: '51K-TEST1', 
            ownerId: customerTest.id, 
            // currentMileage: 15000, // (Xóa trường này, đã bị loại khỏi schema)
            batteryId: faker.helpers.arrayElement(modelVF8.compatibleBatteries).id, // (THÊM MỚI)
            color: 'Đen' 
        } 
    });
    await prisma.vehicle.upsert({ 
        where: { vin: 'VFE34TESTVIN002' }, 
        update: { color: 'Trắng' }, 
        create: { 
            // brand: 'VinFast', model: 'VF e34', // (Xóa 2 trường này)
            vehicleModelId: modelVFe34.id, // (THAY THẾ)
            year: 2022, 
            vin: 'VFE34TESTVIN002', 
            licensePlate: '51K-TEST2', 
            ownerId: customerTest.id, 
            // currentMileage: 42000, // (Xóa trường này)
            batteryId: modelVFe34.compatibleBatteries[0].id, // (THÊM MỚI)
            color: 'Trắng' 
        } 
    });

    // 6. INVENTORY_MANAGER CỨNG (Quản lý kho Q1)
    const inventoryManagerTest = await prisma.user.upsert({
         where: { email: 'inventory@evservice.com' }, update: { employeeCode: 'IM001' },
         create: { fullName: 'Quản lý Kho Q1 (Hardcoded)', email: 'inventory@evservice.com', passwordHash: await bcrypt.hash('inventory123', SALT_ROUNDS), role: Role.INVENTORY_MANAGER, serviceCenterId: testCenter.id, phoneNumber: '0901112225', 
                   employeeCode: 'IM001', isActive: true },
    });
    inventoryManagers.push(inventoryManagerTest);
    console.log(' -> Đã tạo/cập nhật xong 6 tài khoản test cố định.');
    
    // --- TẠO KHÁCH HÀNG FAKE KHÁC & XE (CẬP NHẬT) ---
    const customers = [customerTest]; 
    for (let i = 0; i < 5; i++) { 
        const customer = await prisma.user.create({
            data: {
                fullName: faker.person.fullName(), email: faker.internet.email().toLowerCase(), passwordHash: password, role: Role.CUSTOMER, 
                phoneNumber: faker.phone.number('09########'), 
                address: faker.location.streetAddress(true),
                isActive: true, employeeCode: null 
            },
        });
        customers.push(customer);
        for (let j = 0; j < 1; j++) {
            // Chọn 1 dòng xe ngẫu nhiên (VF8 hoặc VFe34)
            const randomModel = faker.helpers.arrayElement(models);
            // Chọn 1 loại pin ngẫu nhiên TƯƠNG THÍCH với dòng xe đó
            const randomBattery = faker.helpers.arrayElement(randomModel.compatibleBatteries);

            await prisma.vehicle.create({
                data: {
                    // brand: 'VinFast', (Xóa)
                    // model: faker.helpers.arrayElement(['VF8', 'VF e34']), (Xóa)
                    vehicleModelId: randomModel.id, // (THAY THẾ)
                    batteryId: randomBattery.id,    // (THAY THẾ)
                    color: faker.vehicle.color(),
                    year: faker.number.int({ min: 2021, max: 2024 }),
                    vin: faker.vehicle.vin(),
                    licensePlate: faker.vehicle.vrm(),
                    ownerId: customer.id,
                    // currentMileage: faker.number.int({ min: 500, max: 100000 }), (Xóa)
                },
            });
        }
    }
    console.log(`Đã tạo tổng cộng ${customers.length} khách hàng và xe của họ.`);

    // --- TẠO LỊCH HẸN & FEEDBACK ---
    // (Logic này giữ nguyên)
    let allCreatedAppointments = [];
    for (const customer of customers) {
        const created = await seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter);
        allCreatedAppointments = allCreatedAppointments.concat(created);
    }

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

    // --- TẠO DỮ LIỆU CHO CÁC BẢNG CÒN LẠI ---
    // (Toàn bộ logic tạo RestockRequest, ServicePackage, Message, Notification, Report giữ nguyên)
    // 1. Tạo RestockRequest
    console.log('Đang tạo yêu cầu nhập kho (RestockRequest)...');
    for (let i = 0; i < 5; i++) {
        const randomIM = faker.helpers.arrayElement(inventoryManagers);
        const randomPart = faker.helpers.arrayElement(parts);
        const randomStatus = faker.helpers.arrayElement([
            RestockRequestStatus.PENDING, 
            RestockRequestStatus.APPROVED, 
            RestockRequestStatus.REJECTED,
        ]);
        let randomSA = null; // Đây là Station Admin
        
        if (randomStatus !== RestockRequestStatus.PENDING) {
            randomSA = faker.helpers.arrayElement(stationAdmins.filter(sa => sa.serviceCenterId === randomIM.serviceCenterId) || stationAdmins);
        }
        
        await prisma.restockRequest.create({
            data: {
                quantity: faker.number.int({ min: 10, max: 30 }),
                notes: faker.lorem.sentence(),
                status: randomStatus,
                partId: randomPart.id,
                inventoryManagerId: randomIM.id,
                serviceCenterId: randomIM.serviceCenterId,
                
                adminId: randomSA?.id || null, 

                processedAt: randomStatus !== RestockRequestStatus.PENDING ? faker.date.recent() : null,
            }
        });
    }
    console.log(' -> Đã tạo 5 RestockRequests.');

    // 2. Tạo ServicePackage
    console.log('Đang tạo gói dịch vụ (ServicePackage)...');
    await prisma.servicePackage.create({
        data: {
            name: "Gói Bảo dưỡng 1 năm",
            expiryDate: faker.date.future({years: 1}),
            customerId: customerTest.id
        }
    });
    console.log(' -> Đã tạo 1 ServicePackage.');

    // 3. Tạo Message
    console.log('Đang tạo tin nhắn (Message)...');
    await prisma.message.create({
        data: {
            content: "Chào bạn, xe của bạn đã sẵn sàng.",
            senderId: staffTest.id,
            receiverId: customerTest.id,
        }
    });
    console.log(' -> Đã tạo 1 Message.');

    // 4. Tạo Notification
    console.log('Đang tạo thông báo (Notification)...');
    await prisma.notification.create({
        data: {
            message: "Lịch hẹn #12345 của bạn đã được xác nhận.",
            recipientId: customerTest.id,
        }
    });
    console.log(' -> Đã tạo 1 Notification.');

    // 5. Tạo Report
    console.log('Đang tạo báo cáo (Report)...');
    await prisma.report.create({
        data: {
            reportType: "Doanh thu tháng 10",
            generatedDate: new Date(),
            adminId: adminTest.id,
        }
    });
    console.log(' -> Đã tạo 1 Report.');
    
    // --- TẠO GỢI Ý BẢO DƯỠNG (MỚI) ---
    await seedMaintenanceRecommendations(serviceTypes);

    // --- KẾT THÚC ---
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