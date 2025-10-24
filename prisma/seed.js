const { PrismaClient, Prisma } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs'); // Sử dụng bcryptjs

const prisma = new PrismaClient();

// --- HÀM TẠO DỮ LIỆU PHỤ TRỢ ---

// Tạo các loại dịch vụ
async function seedServiceTypes() {
    console.log('Đang tạo các loại dịch vụ...');
    const serviceTypesData = [
        { name: 'Bảo dưỡng định kỳ', description: 'Kiểm tra tổng quát và bảo dưỡng theo khuyến nghị.' },
        { name: 'Kiểm tra Pin Cao Áp', description: 'Đo dung lượng, kiểm tra hệ thống làm mát.' },
        { name: 'Dịch vụ Lốp Xe', description: 'Thay lốp, cân bằng động, đảo lốp.' },
        { name: 'Hệ thống Phanh', description: 'Kiểm tra má phanh, đĩa phanh, dầu phanh.' },
        { name: 'Hệ thống Điều hòa', description: 'Kiểm tra gas, thay lọc gió cabin.' },
        { name: 'Cập nhật Phần mềm', description: 'Cập nhật phiên bản phần mềm mới nhất cho xe.' },
    ];
    await prisma.serviceType.createMany({
        data: serviceTypesData,
        skipDuplicates: true,
    });
    console.log(' -> Đã tạo xong các loại dịch vụ.');
    return prisma.serviceType.findMany();
}

// Tạo Phụ tùng và Kho hàng
async function seedPartsAndInventory(serviceCenters) {
    console.log('Đang tạo phụ tùng và kho hàng...');
    const partsData = [
        { sku: 'VIN-TYRE-001', name: 'Lốp Michelin Pilot Sport EV 235/55 R19', price: 5500000, description: 'Lốp hiệu suất cao cho xe điện.' },
        { sku: 'VIN-BAT-COOL-1L', name: 'Nước làm mát pin (1L)', price: 350000, description: 'Dung dịch làm mát chuyên dụng.' },
        { sku: 'VIN-FILTER-AC-HEPA', name: 'Lọc gió điều hòa HEPA PM2.5', price: 780000, description: 'Lọc bụi mịn và tác nhân gây dị ứng.' },
        { sku: 'VIN-BRAKE-PAD-F', name: 'Má phanh trước (Bộ)', price: 2100000, description: 'Bộ má phanh chính hãng.' },
        { sku: 'VIN-WIPER-BLADE', name: 'Lưỡi gạt mưa (Cặp)', price: 450000, description: 'Lưỡi gạt mưa silicone cao cấp.' },
    ];

    const createdParts = [];
    for (const part of partsData) {
        const newPart = await prisma.part.upsert({
            where: { sku: part.sku },
            update: { name: part.name, price: new Prisma.Decimal(part.price), description: part.description }, // Cập nhật cả price và description
            create: { ...part, price: new Prisma.Decimal(part.price) }, // Đảm bảo price là Decimal
        });
        createdParts.push(newPart);
        console.log(` -> Đã tạo/cập nhật phụ tùng: ${newPart.name}`);
    }

    // Tạo kho hàng cho mỗi trung tâm
    for (const center of serviceCenters) {
        for (const part of createdParts) {
            // --- THAY ĐỔI: Sử dụng create thay vì upsert ---
            await prisma.inventoryItem.create({
                data: {
                    partId: part.id,
                    serviceCenterId: center.id,
                    quantityInStock: faker.number.int({ min: 10, max: 100 }),
                    minStockLevel: 5,
                },
            });
        }
        console.log(` -> Đã tạo kho hàng cho trung tâm ${center.name}`);
    }
    return createdParts;
}

// Tạo lịch hẹn và các dữ liệu liên quan
async function seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter) {
    console.log(`Đang tạo lịch hẹn cho khách hàng: ${customer.email}`);
    const vehicles = await prisma.vehicle.findMany({ where: { ownerId: customer.id } });
    if (vehicles.length === 0) {
        console.log(` -> Khách hàng ${customer.email} chưa có xe, bỏ qua.`);
        return;
    }

    for (let i = 0; i < 2; i++) { // Tạo 2 lịch hẹn/khách
        const randomVehicle = faker.helpers.arrayElement(vehicles);
        const randomCenter = faker.helpers.arrayElement(serviceCenters);
        const servicesToBook = faker.helpers.arrayElements(serviceTypes, { min: 1, max: 3 });
        const status = faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);

        let appointmentDate;
        if (status === 'PENDING' || status === 'CONFIRMED') {
            appointmentDate = faker.date.soon({ days: 30 }); // Lịch hẹn tương lai
        } else {
            appointmentDate = faker.date.recent({ days: 60 }); // Lịch hẹn quá khứ
        }
        // Đảm bảo giờ hẹn nằm trong giờ làm việc (ví dụ: 9h-11h, 14h-16h)
        appointmentDate.setHours(faker.helpers.arrayElement([9, 10, 11, 14, 15, 16]), 0, 0, 0);

        const appointmentInput = {
            appointmentDate: appointmentDate,
            status: status,
            customerNotes: faker.lorem.sentence(),
            customerId: customer.id,
            vehicleId: randomVehicle.id,
            serviceCenterId: randomCenter.id,
            // Kết nối các ServiceType yêu cầu
            requestedServices: {
                create: servicesToBook.map(service => ({
                    serviceTypeId: service.id,
                })),
            },
        };

        // Nếu lịch hẹn đã hoàn thành hoặc đang thực hiện, tạo ServiceRecord và các dữ liệu liên quan
        if (status === 'COMPLETED' || status === 'IN_PROGRESS') {
            const centerTechnicians = techniciansByCenter[randomCenter.id];
            if (centerTechnicians && centerTechnicians.length > 0) {
                const randomTechnician = faker.helpers.arrayElement(centerTechnicians);
                const startTime = appointmentDate;
                const endTime = status === 'COMPLETED' ? new Date(startTime.getTime() + faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000) : null; // Giả sử làm 1-4 tiếng

                const serviceRecordInput = {
                    technicianId: randomTechnician.id,
                    status: status,
                    startTime: startTime,
                    endTime: endTime,
                    staffNotes: status === 'COMPLETED' ? 'Đã hoàn thành bảo dưỡng.' : 'Đang tiến hành kiểm tra.',
                };

                // Tạo dữ liệu sử dụng phụ tùng (chỉ cho COMPLETED)
                if (status === 'COMPLETED') {
                    const partsToUse = faker.helpers.arrayElements(parts, { min: 0, max: 2 });
                    if (partsToUse.length > 0) {
                        serviceRecordInput.partsUsed = {
                            create: partsToUse.map(part => ({
                                partId: part.id,
                                quantity: faker.number.int({ min: 1, max: 2 }),
                                unitPrice: part.price, // Prisma tự xử lý Decimal
                            })),
                        };
                    }

                    // Tạo báo giá (Quotation)
                    // Chuyển đổi giá sang số trước khi tính toán
                    const estimatedCost = servicesToBook.length * 500000 + partsToUse.reduce((sum, p) => sum + Number(p.price), 0);
                    serviceRecordInput.quotation = {
                        create: {
                            estimatedCost: new Prisma.Decimal(estimatedCost), // Chuyển thành Decimal
                        }
                    };

                    // Tạo hóa đơn (Invoice)
                    const totalAmount = estimatedCost * 1.1; // Giả lập thêm VAT
                    const invoiceInput = {
                        totalAmount: new Prisma.Decimal(totalAmount), // Chuyển thành Decimal
                        dueDate: faker.date.future({ refDate: endTime ?? new Date() }), // Handle endTime potentially null
                        status: faker.helpers.arrayElement(['PAID', 'UNPAID']),
                    };

                    // Tạo thanh toán (Payment) nếu hóa đơn đã PAID
                    if (invoiceInput.status === 'PAID') {
                        invoiceInput.payments = {
                            create: {
                                paymentMethod: faker.helpers.arrayElement(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER']),
                                status: 'SUCCESSFUL',
                                paymentDate: endTime ?? new Date(), // Handle endTime potentially null
                            }
                        };
                    }
                    serviceRecordInput.invoice = { create: invoiceInput };
                }

                appointmentInput.serviceRecord = { create: serviceRecordInput };
            } else {
                console.warn(` -> Không tìm thấy kỹ thuật viên cho trung tâm ${randomCenter.name} để tạo ServiceRecord.`);
            }
        }

        await prisma.serviceAppointment.create({ data: appointmentInput });
    }
    console.log(` -> Đã tạo 2 lịch hẹn cho ${customer.email}`);
}

// --- HÀM CHÍNH ĐỂ SEED ---
async function main() {
    console.log('Bắt đầu quá trình seeding...');
    const SALT_ROUNDS = 10;
    const password = await bcrypt.hash('123456', SALT_ROUNDS);

    // --- DỌN DẸP DỮ LIỆU CŨ (Thứ tự rất quan trọng) ---
    console.log('Xóa dữ liệu cũ...');
    // Xóa theo thứ tự ngược lại của sự phụ thuộc
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.partUsage.deleteMany();
    await prisma.feedback.deleteMany(); // Phụ thuộc appointmentId
    await prisma.serviceRecord.deleteMany(); // Phụ thuộc appointmentId, technicianId
    await prisma.appointmentService.deleteMany(); // Phụ thuộc appointmentId, serviceTypeId
    await prisma.serviceAppointment.deleteMany(); // Phụ thuộc customerId, vehicleId, serviceCenterId
    await prisma.inventoryItem.deleteMany(); // Phụ thuộc partId, serviceCenterId
    await prisma.part.deleteMany();
    await prisma.serviceType.deleteMany();
    await prisma.vehicle.deleteMany(); // Phụ thuộc ownerId
    await prisma.technicianProfile.deleteMany(); // Phụ thuộc userId
    await prisma.staffCertification.deleteMany(); // Phụ thuộc userId, certificationId
    await prisma.certification.deleteMany();
    await prisma.message.deleteMany(); // Phụ thuộc userId
    await prisma.notification.deleteMany(); // Phụ thuộc userId
    await prisma.report.deleteMany(); // Phụ thuộc userId
    await prisma.servicePackage.deleteMany(); // Phụ thuộc userId
    await prisma.user.deleteMany(); // Phụ thuộc serviceCenterId
    await prisma.serviceCenter.deleteMany();
    console.log('Đã xóa dữ liệu cũ.');

    // --- TẠO CÁC LOẠI DỊCH VỤ ---
    const serviceTypes = await seedServiceTypes();

    // --- TẠO TÀI KHOẢN ADMIN TỔNG ---
    const admin = await prisma.user.create({
        data: {
            fullName: 'Admin Master', email: 'admin@ev.com', passwordHash: password, role: 'ADMIN', phoneNumber: faker.phone.number(),
        },
    });
    console.log(`Đã tạo tài khoản Admin tổng: ${admin.email}`);

    // --- TẠO DỮ LIỆU TRUNG TÂM VÀ NHÂN VIÊN ---
    const serviceCenters = [];
    const techniciansByCenter = {}; // { centerId: [tech1, tech2,...] }

    for (let i = 0; i < 3; i++) {
        const center = await prisma.serviceCenter.create({
            data: {
                name: `VinFast Service Quận ${i + 1}`, address: faker.location.streetAddress({ city: 'Hồ Chí Minh' }), phoneNumber: faker.phone.number(), openingTime: '08:00', closingTime: '17:00', slotDurationMinutes: 60, capacityPerSlot: faker.number.int({ min: 2, max: 4 }), // Năng suất ngẫu nhiên
            },
        });
        serviceCenters.push(center);
        console.log(`Đã tạo trung tâm: ${center.name}`);

        techniciansByCenter[center.id] = []; // Khởi tạo mảng KTV cho trung tâm

        // Tạo Station Admin cho mỗi trung tâm
        await prisma.user.create({
            data: {
                fullName: `Quản lý Trạm ${i + 1}`, email: `stationadmin${i + 1}@ev.com`, passwordHash: password, role: 'STATION_ADMIN', serviceCenterId: center.id, // Liên kết Station Admin với trạm
                phoneNumber: faker.phone.number(), isActive: true,
            }
        });

        // Tạo Staff (nhân viên lễ tân/cố vấn)
        await prisma.user.create({
            data: {
                fullName: `Nhân viên ${faker.person.firstName()} (Q.${i + 1})`, email: `staff${i + 1}@ev.com`, passwordHash: password, role: 'STAFF', serviceCenterId: center.id, phoneNumber: faker.phone.number(), isActive: true,
            }
        });

        // Tạo Technicians
        for (let j = 0; j < 3; j++) { // Tạo 3 KTV/trung tâm
            const tech = await prisma.user.create({
                data: {
                    fullName: `Kỹ thuật viên ${faker.person.firstName()} (Q.${i + 1})`, email: `tech${i + 1}_${j + 1}@ev.com`, passwordHash: password, role: 'TECHNICIAN', serviceCenterId: center.id, phoneNumber: faker.phone.number(), isActive: true,
                },
            });
            techniciansByCenter[center.id].push(tech); // Thêm KTV vào danh sách của trung tâm
        }
        console.log(` -> Đã tạo nhân sự cho ${center.name}`);
    }

    // --- TẠO PHỤ TÙNG VÀ KHO HÀNG ---
    const parts = await seedPartsAndInventory(serviceCenters);

    // --- TẠO CÁC TÀI KHOẢN CỐ ĐỊNH ĐỂ TEST ---
    console.log('Đang tạo các tài khoản test cố định...');
    const center1Id = serviceCenters[0].id;

    // 1. Customer Test
    const customerTest = await prisma.user.create({
        data: {
            fullName: 'Khách Hàng Test', email: 'customer@ev.com', passwordHash: password, role: 'CUSTOMER', phoneNumber: '0909123456', address: '123 Đường Test, Quận 1',
        },
    });
    // Tạo xe cho Customer Test
    await prisma.vehicle.createMany({
        data: [
            { make: 'VinFast', model: 'VF8', year: 2023, vin: faker.vehicle.vin(), licensePlate: '51K-TEST1', ownerId: customerTest.id, currentMileage: 15000 },
            { make: 'VinFast', model: 'VF e34', year: 2022, vin: faker.vehicle.vin(), licensePlate: '51K-TEST2', ownerId: customerTest.id, currentMileage: 42000 },
        ]
    });

    // 2. Technician Test (Quận 1) - Lấy KTV đầu tiên của trung tâm 1 làm tài khoản test
    // Đảm bảo techniciansByCenter[center1Id] không rỗng
    if (techniciansByCenter[center1Id] && techniciansByCenter[center1Id].length > 0) {
       const techTest = techniciansByCenter[center1Id][0];
       console.log(` -> Sử dụng KTV ${techTest.email} làm tài khoản test.`);
    } else {
       console.warn(` -> Không có KTV nào được tạo cho Trung tâm 1 để làm tài khoản test.`);
    }


    // --- TẠO KHÁCH HÀNG FAKE VÀ XE CỦA HỌ ---
    const customers = [customerTest]; // Bắt đầu với tài khoản test
    for (let i = 0; i < 10; i++) {
        const customer = await prisma.user.create({
            data: {
                fullName: faker.person.fullName(), email: faker.internet.email().toLowerCase(), passwordHash: password, role: 'CUSTOMER', phoneNumber: faker.phone.number(), address: faker.location.streetAddress({ city: 'Hồ Chí Minh' }),
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
    console.log(`Đã tạo tổng cộng ${customers.length} khách hàng và xe của họ.`);

    // --- TẠO LỊCH HẸN VÀ CÁC DỮ LIỆU LIÊN QUAN ---
    for (const customer of customers) {
        await seedAppointmentsForCustomer(customer, serviceCenters, serviceTypes, parts, techniciansByCenter);
    }

    // --- (Tùy chọn) TẠO THÊM DỮ LIỆU KHÁC ---
    // Ví dụ: Tạo Feedback ngẫu nhiên cho các lịch hẹn đã hoàn thành
    const completedAppointments = await prisma.serviceAppointment.findMany({
        where: { status: 'COMPLETED' },
        select: { id: true, customerId: true }
    });
    for(const app of completedAppointments) {
        // Kiểm tra xem schema Feedback có trường appointmentId không
        // Nếu có, thực hiện tạo feedback
        // if (prisma.feedback.fields.appointmentId) { // Cách kiểm tra không chính xác
        try {
            if (faker.datatype.boolean(0.7)) { // 70% cơ hội có feedback
                await prisma.feedback.create({
                    data: {
                        customerId: app.customerId,
                        appointmentId: app.id, // Giả định trường này tồn tại
                        rating: faker.number.int({ min: 3, max: 5 }),
                        content: faker.lorem.paragraph()
                    }
                });
            }
        } catch (error) {
             // Bắt lỗi nếu trường appointmentId không tồn tại hoặc có lỗi khác
             if (error instanceof Prisma.PrismaClientValidationError && error.message.includes('Unknown arg')) {
                 console.warn(` -> Lược đồ Feedback chưa có trường 'appointmentId'. Bỏ qua tạo Feedback cho lịch hẹn ${app.id}.`);
             } else {
                 console.error(` -> Lỗi khi tạo Feedback cho lịch hẹn ${app.id}:`, error);
             }
        }
        // } else {
        //     console.warn(" -> Schema Feedback không có trường appointmentId. Bỏ qua tạo Feedback.");
        //     break; // Chỉ cảnh báo một lần
        // }
    }
    console.log(`Đã tạo Feedback ngẫu nhiên (nếu có thể).`);

    console.log('Hoàn tất quá trình seeding!');
}

main()
    .catch((e) => {
        console.error('Lỗi trong quá trình seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });