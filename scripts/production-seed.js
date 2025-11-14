// Tệp: scripts/production-seed.js
// (PHIÊN BẢN CẬP NHẬT HOÀN CHỈNH - Đã xóa Quotation, Cập nhật luồng KTV, Thêm unitPrice cho Restock)

const { PrismaClient, Prisma, Role, AppointmentStatus, ServiceRecordStatus, InvoiceStatus, PaymentStatus, RestockRequestStatus, PartUsageStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Hàm helper để tạo mật khẩu hash
const hashPassword = (pass) => bcrypt.hash(pass, SALT_ROUNDS);

/**
 * (SỬA) Dọn dẹp CSDL (Đã xóa Quotation)
 */
async function cleanupDatabase() {
    console.log('🗑️ Đang dọn dẹp CSDL...');
    // Xóa theo thứ tự phụ thuộc (từ con đến cha)
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    // await prisma.quotation.deleteMany(); // (ĐÃ XÓA)
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
    
    await prisma.vehicle.deleteMany();
    
    await prisma.batteryType.deleteMany(); 
    await prisma.vehicleModel.deleteMany(); 

    await prisma.servicePackage.deleteMany(); 
    await prisma.message.deleteMany(); 
    await prisma.notification.deleteMany(); 
    await prisma.report.deleteMany(); 
    await prisma.technicianProfile.deleteMany(); 
    await prisma.staffCertification.deleteMany(); 
    await prisma.certification.deleteMany(); 
    await prisma.user.deleteMany();
    await prisma.serviceCenter.deleteMany();
    console.log('✅ Đã xóa dữ liệu cũ.');
}

/**
 * (SỬA) Hàm tạo Dữ liệu Gốc (Không dùng ID cứng)
 */
async function seedMasterData() {
    console.log('🔧 Tạo Dữ liệu Gốc (Dịch vụ, Phụ tùng, Model, Pin)...');
    
    // 1. Dịch vụ (Thêm 'price' cho tất cả)
    const serviceTypesData = [
        { name: 'Gói Bảo dưỡng Cơ bản', description: 'Kiểm tra tổng quát, kiểm tra phanh.', price: 500000 },
        { name: 'Gói Kiểm tra Pin Cao Áp', description: 'Đo dung lượng, kiểm tra hệ thống làm mát pin.', price: 300000 },
        { name: 'Gói Hệ thống Phanh', description: 'Kiểm tra má phanh, đĩa phanh, dầu phanh.', price: 250000 },
        { name: 'Gói Hệ thống Điều hòa', description: 'Kiểm tra gas, thay lọc gió cabin.', price: 150000 } 
    ];
    await prisma.serviceType.createMany({ data: serviceTypesData });
    const serviceTypes = await prisma.serviceType.findMany();
    
    // 2. Phụ tùng (Dùng upsert vì 'sku' là @unique)
    const part_lop = await prisma.part.upsert({ 
        where: { sku: 'VF-TYRE-001' }, update: { price: 4500000 },
        create: { sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8', price: new Prisma.Decimal(4500000) } 
    });
    const part_locgio = await prisma.part.upsert({ 
        where: { sku: 'VF-FILTER-AC' }, update: { price: 780000 },
        create: { sku: 'VF-FILTER-AC', name: 'Lọc gió điều hòa HEPA', price: new Prisma.Decimal(780000) } 
    });
    const part_nuocmat = await prisma.part.upsert({ 
        where: { sku: 'VF-BAT-COOL' }, update: { price: 350000 },
        create: { sku: 'VF-BAT-COOL', name: 'Nước làm mát pin (1L)', price: new Prisma.Decimal(350000) } 
    });
    
    // 3. Pin (Dùng 'name' làm where vì @unique)
    const battery90 = await prisma.batteryType.upsert({
        where: { name: 'Pin LFP 90kWh (Thuê)' }, update: {},
        create: { name: 'Pin LFP 90kWh (Thuê)', capacityKwh: 90 },
    });
    const battery77 = await prisma.batteryType.upsert({
        where: { name: 'Pin LFP 77kWh (VF e34)' }, update: {},
        create: { name: 'Pin LFP 77kWh (VF e34)', capacityKwh: 77 },
    });

    // 4. Model (Dùng 'create' vì CSDL đã được dọn dẹp)
    const modelVF8 = await prisma.vehicleModel.create({
        data: { brand: 'VinFast', name: 'VF8', compatibleBatteries: { connect: [{ id: battery90.id }] } },
        include: { compatibleBatteries: true }
    });
    const modelVFe34 = await prisma.vehicleModel.create({
        data: { brand: 'VinFast', name: 'VF e34', compatibleBatteries: { connect: [{ id: battery77.id }] } },
        include: { compatibleBatteries: true }
    });

    console.log('✅ Đã tạo Dữ liệu Gốc.');
    return {
        serviceTypes: serviceTypes,
        parts: [part_lop, part_locgio, part_nuocmat],
        models: [modelVF8, modelVFe34]
    };
}

// --- (THÊM HÀM MỚI TỪ SEED.JS) ---
async function seedMaintenanceRecommendations(serviceTypes) {
    console.log('Đang tạo gợi ý bảo dưỡng (MaintenanceRecommendations)...');
    
    // Lấy ID bằng tên
    const bdDinhKy = serviceTypes.find(s => s.name.includes('Bảo dưỡng'))?.id;
    const kiemTraPin = serviceTypes.find(s => s.name.includes('Pin Cao Áp'))?.id;
    const heThongPhanh = serviceTypes.find(s => s.name.includes('Hệ thống Phanh'))?.id;
    const dieuHoa = serviceTypes.find(s => s.name.includes('Hệ thống Điều hòa'))?.id;

    const recommendations = [];

    if (bdDinhKy) recommendations.push({ model: 'ALL', mileageMilestone: 5000, serviceTypeId: bdDinhKy });
    if (bdDinhKy) recommendations.push({ model: 'ALL', mileageMilestone: 10000, serviceTypeId: bdDinhKy });
    if (dieuHoa) recommendations.push({ model: 'ALL', mileageMilestone: 10000, serviceTypeId: dieuHoa }); 
    if (bdDinhKy) recommendations.push({ model: 'VF8', mileageMilestone: 15000, serviceTypeId: bdDinhKy });
    if (bdDinhKy) recommendations.push({ model: 'VF8', mileageMilestone: 20000, serviceTypeId: bdDinhKy });
    if (kiemTraPin) recommendations.push({ model: 'VF8', mileageMilestone: 20000, serviceTypeId: kiemTraPin });
    if (heThongPhanh) recommendations.push({ model: 'VF8', mileageMilestone: 20000, serviceTypeId: heThongPhanh });
    if (bdDinhKy) recommendations.push({ model: 'VF e34', mileageMilestone: 30000, serviceTypeId: bdDinhKy });
    if (kiemTraPin) recommendations.push({ model: 'VF e34', mileageMilestone: 30000, serviceTypeId: kiemTraPin });

    if (recommendations.length > 0) {
        await prisma.maintenanceRecommendation.createMany({
            data: recommendations,
            skipDuplicates: true,
        });
    }
    console.log(` -> Đã tạo ${recommendations.length} gợi ý bảo dưỡng.`);
}
// --- (KẾT THÚC HÀM MỚI) ---


async function createProductionSeedData() {
    try {
        console.log('🌱 Bắt đầu tạo dữ liệu mẫu cho production...\n');
        
        // --- 0. DỌN DẸP ---
        await cleanupDatabase();

        // --- 1. TẠO TRUNG TÂM DỊCH VỤ (2 TRẠM) ---
        console.log('🏢 Tạo 2 trung tâm dịch vụ...');
        const centerHcm = await prisma.serviceCenter.create({
            data: {
                name: 'EV Service Center Hồ Chí Minh',
                address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                phoneNumber: '028-1111-2222',
                capacityPerSlot: 3
            }
        });
        const centerHn = await prisma.serviceCenter.create({
            data: {
                name: 'EV Service Center Hà Nội',
                address: '55 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
                phoneNumber: '024-3333-4444',
                capacityPerSlot: 2
            }
        });
        const allCenters = [centerHcm, centerHn];
        console.log(`✅ Đã tạo: ${centerHcm.name}, ${centerHn.name}`);

        // --- 2. TẠO DỮ LIỆU GỐC (Parts, Services, Models, Batteries) ---
        const { serviceTypes, parts, models } = await seedMasterData();
        const modelVF8 = models.find(m => m.name === 'VF8');
        const modelVFe34 = models.find(m => m.name === 'VF e34');
        const svt_bdk = serviceTypes.find(s => s.name.includes('Bảo dưỡng'));
        const svt_pin = serviceTypes.find(s => s.name.includes('Pin Cao Áp'));
        const [part_lop, part_locgio, part_nuocmat] = parts;

        // --- GỌI HÀM SEED GỢI Ý ---
        await seedMaintenanceRecommendations(serviceTypes);

        // 3. TẠO KHO HÀNG CHO CÁC TRẠM
        console.log('📦 Tạo kho hàng cho các trạm...');
        for (const center of allCenters) {
            for (const part of parts) {
                await prisma.inventoryItem.create({
                    data: {
                        partId: part.id,
                        serviceCenterId: center.id,
                        quantityInStock: Math.floor(Math.random() * 41) + 10,
                        minStockLevel: 5
                    }
                });
            }
        }
        console.log('✅ Đã tạo kho hàng.');


        // --- 4. TẠO TÀI KHOẢN (CỨNG VÀ CHO TỪNG TRẠM) ---
        console.log('👥 Tạo các tài khoản test...');
        
        const admin = await prisma.user.upsert({
            where: { email: 'admin@evservice.com' },
            update: { employeeCode: 'ADMIN001', isActive: true },
            create: { fullName: 'Admin Tổng', email: 'admin@evservice.com', passwordHash: await hashPassword('admin123'), role: Role.ADMIN, employeeCode: 'ADMIN001', isActive: true }
        });

        // Tạo nhân sự cho từng trạm
        const staffByCenter = {}; 
        
        for (const center of allCenters) {
            const suffix = center.name.includes('HCM') ? 'hcm' : 'hn';
            
            const sa = await prisma.user.upsert({
                where: { email: `station.${suffix}@evservice.com` }, update: {},
                create: { fullName: `Trưởng trạm ${suffix.toUpperCase()}`, email: `station.${suffix}@evservice.com`, passwordHash: await hashPassword('station123'), role: Role.STATION_ADMIN, employeeCode: `SA_${suffix.toUpperCase()}001`, serviceCenterId: center.id, isActive: true }
            });
            const staff = await prisma.user.upsert({
                where: { email: `staff.${suffix}@evservice.com` }, update: {},
                create: { fullName: `Nhân viên ${suffix.toUpperCase()}`, email: `staff.${suffix}@evservice.com`, passwordHash: await hashPassword('staff123'), role: Role.STAFF, employeeCode: `STAFF_${suffix.toUpperCase()}001`, serviceCenterId: center.id, isActive: true }
            });
            const tech = await prisma.user.upsert({
                where: { email: `tech.${suffix}@evservice.com` }, update: {},
                create: { fullName: `Kỹ thuật viên ${suffix.toUpperCase()}`, email: `tech.${suffix}@evservice.com`, passwordHash: await hashPassword('tech123'), role: Role.TECHNICIAN, employeeCode: `TECH_${suffix.toUpperCase()}001`, serviceCenterId: center.id, isActive: true }
            });
            const im = await prisma.user.upsert({
                where: { email: `inventory.${suffix}@evservice.com` }, update: {},
                create: { fullName: `Quản lý kho ${suffix.toUpperCase()}`, email: `inventory.${suffix}@evservice.com`, passwordHash: await hashPassword('inventory123'), role: Role.INVENTORY_MANAGER, employeeCode: `IM_${suffix.toUpperCase()}001`, serviceCenterId: center.id, isActive: true }
            });

            staffByCenter[center.id] = { sa, staff, tech, im };
        }
        
        const customer1 = await prisma.user.upsert({
            where: { email: 'customer1@example.com' }, update: {},
            create: { fullName: 'Khách hàng 001 (HCM)', email: 'customer1@example.com', passwordHash: await hashPassword('customer123'), role: Role.CUSTOMER, isActive: true }
        });
        const customer2 = await prisma.user.upsert({
            where: { email: 'customer2@example.com' }, update: {},
            create: { fullName: 'Khách hàng 002 (HN)', email: 'customer2@example.com', passwordHash: await hashPassword('customer123'), role: Role.CUSTOMER, isActive: true }
        });
        console.log('✅ Đã tạo các tài khoản.');

        // --- 5. TẠO XE (Sử dụng schema mới) ---
        console.log('🚗 Tạo 2 xe mẫu...');
        const vehicle1 = await prisma.vehicle.upsert({
            where: { vin: 'PROD_VIN_001' }, update: {},
            create: {
                ownerId: customer1.id,
                vin: 'PROD_VIN_001',
                year: 2023,
                vehicleModelId: modelVF8.id,
                batteryId: modelVF8.compatibleBatteries[0].id,
                licensePlate: '51K-001.01',
                currentMileage: 15000 
            }
        });
        const vehicle2 = await prisma.vehicle.upsert({
            where: { vin: 'PROD_VIN_002' }, update: {},
            create: {
                ownerId: customer2.id,
                vin: 'PROD_VIN_002',
                year: 2022,
                vehicleModelId: modelVFe34.id,
                batteryId: modelVFe34.compatibleBatteries[0].id,
                licensePlate: '29A-002.02',
                currentMileage: 30000 
            }
        });
        console.log('✅ Đã tạo xe.');

        // --- 6. TẠO DỮ LIỆU MẪU CHO CÁC TRẠNG THÁI (ĐÃ CẬP NHẬT) ---
        console.log('🔄 Tạo dữ liệu mẫu cho các trạng thái (Luồng mới)...');
        const now = new Date();
        const tomorrow = new Date(new Date().setDate(now.getDate() + 1));
        const nextWeek = new Date(new Date().setDate(now.getDate() + 7));
        const lastWeek = new Date(new Date().setDate(now.getDate() - 7));
        const lastMonth = new Date(new Date().setDate(now.getDate() - 30));

        // 6.1. APPOINTMENT_PENDING (HCM)
        await prisma.serviceAppointment.create({
            data: {
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: tomorrow, status: AppointmentStatus.PENDING,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] }
            }
        });

        // 6.2. APPOINTMENT_CONFIRMED (-> ServiceRecord PENDING) (HN)
        await prisma.serviceAppointment.create({
            data: {
                customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: nextWeek, status: AppointmentStatus.CONFIRMED,
                requestedServices: { create: [{ serviceTypeId: svt_pin.id }] },
                serviceRecord: {
                    create: { 
                        technicianId: staffByCenter[centerHn.id].tech.id, 
                        status: ServiceRecordStatus.PENDING 
                    }
                }
            }
        });

        // 6.3. APPOINTMENT_IN_PROGRESS (-> SR IN_PROGRESS) (HCM)
        // (Thay thế cho PENDING_APPROVAL)
        await prisma.serviceAppointment.create({
            data: {
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.IN_PROGRESS,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] },
                serviceRecord: {
                    create: {
                        technicianId: staffByCenter[centerHcm.id].tech.id, 
                        status: ServiceRecordStatus.IN_PROGRESS,
                        // (XÓA) Bỏ Quotation
                        partsUsed: { // (SỬA) KTV đã dùng
                            create: { partId: part_locgio.id, quantity: 1, unitPrice: part_locgio.price, status: PartUsageStatus.ISSUED }
                        }
                    }
                }
            }
        });

        // 6.4. APPOINTMENT_COMPLETED (-> SR COMPLETED, Invoice UNPAID) (HCM)
        // (Thay thế cho WAITING_PARTS)
        await prisma.serviceAppointment.create({
            data: {
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastMonth, status: AppointmentStatus.COMPLETED,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] },
                serviceRecord: {
                    create: {
                        technicianId: staffByCenter[centerHcm.id].tech.id, 
                        status: ServiceRecordStatus.COMPLETED, 
                        endTime: lastMonth,
                        // (XÓA) Bỏ Quotation
                        partsUsed: { create: { partId: part_lop.id, quantity: 1, unitPrice: part_lop.price, status: PartUsageStatus.ISSUED } },
                        invoice: {
                            create: { 
                                // (SỬA) Tính tổng = Gói (500k) + Lốp (4.5M)
                                totalAmount: new Prisma.Decimal(500000 + 4500000), 
                                dueDate: nextWeek, 
                                status: InvoiceStatus.UNPAID 
                            }
                        }
                    }
                }
            }
        });
        
        // 6.5. APPOINTMENT_COMPLETED (-> SR COMPLETED, Invoice PAID) (HN)
        await prisma.serviceAppointment.create({
            data: {
                customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: lastMonth, status: AppointmentStatus.COMPLETED,
                requestedServices: { create: [{ serviceTypeId: svt_pin.id }] },
                serviceRecord: {
                    create: {
                        technicianId: staffByCenter[centerHn.id].tech.id, 
                        status: ServiceRecordStatus.COMPLETED, 
                        endTime: lastMonth,
                        // (XÓA) Bỏ Quotation
                        partsUsed: { create: { partId: part_nuocmat.id, quantity: 1, unitPrice: part_nuocmat.price, status: PartUsageStatus.ISSUED } },
                        invoice: {
                            create: { 
                                // (SỬA) Tính tổng = Gói (300k) + Nước mát (350k)
                                totalAmount: new Prisma.Decimal(300000 + 350000), 
                                dueDate: lastMonth, 
                                status: InvoiceStatus.PAID,
                                payments: {
                                    create: { 
                                        paymentMethod: 'CASH', 
                                        status: PaymentStatus.SUCCESSFUL, 
                                        paymentDate: lastMonth 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // 6.6. APPOINTMENT_CANCELLED (-> SR CANCELLED) (HCM)
        await prisma.serviceAppointment.create({
            data: {
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.CANCELLED,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] }
                // (Không cần tạo ServiceRecord nếu Hủy trước khi CONFIRMED)
            }
        });
        console.log('✅ Đã tạo dữ liệu mẫu cho các trạng thái Lịch hẹn.');

        // 6.7. RESTOCK_REQUEST (Đã thêm unitPrice)
        // (SỬA) Thêm unitPrice vào
        await prisma.restockRequest.createMany({
            data: [
                // HCM
                { quantity: 10, partId: part_lop.id, unitPrice: part_lop.price, inventoryManagerId: staffByCenter[centerHcm.id].im.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.PENDING },
                { quantity: 5, partId: part_locgio.id, unitPrice: part_locgio.price, inventoryManagerId: staffByCenter[centerHcm.id].im.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.APPROVED, adminId: staffByCenter[centerHcm.id].sa.id, processedAt: now },
                // HN
                { quantity: 20, partId: part_nuocmat.id, unitPrice: part_nuocmat.price, inventoryManagerId: staffByCenter[centerHn.id].im.id, serviceCenterId: centerHn.id, status: RestockRequestStatus.REJECTED, adminId: admin.id, processedAt: now },
                { quantity: 15, partId: part_lop.id, unitPrice: part_lop.price, inventoryManagerId: staffByCenter[centerHn.id].im.id, serviceCenterId: centerHn.id, status: RestockRequestStatus.COMPLETED, adminId: staffByCenter[centerHn.id].sa.id, processedAt: lastWeek }
            ]
        });
        console.log('✅ Đã tạo dữ liệu mẫu cho các trạng thái Nhập kho.');

        console.log('\n🎉 Production seed data hoàn tất!');
        console.log('\n📋 Thông tin đăng nhập (khớp với yêu cầu của bạn):');
        console.log(`  👤 Admin:         admin@evservice.com       (pass: admin123)`);
        console.log(`  👨‍💼 Station HCM:   station.hcm@evservice.com (pass: station123)`);
        console.log(`  👨‍🔧 Staff HCM:     staff.hcm@evservice.com     (pass: staff123)`);
        console.log(`  🔧 Tech HCM:      tech.hcm@evservice.com      (pass: tech123)`);
        console.log(`  📦 IM HCM:        inventory.hcm@evservice.com (pass: inventory123)`);
        console.log(`  👨‍💼 Station HN:    station.hn@evservice.com  (pass: station123)`);
        
        // (SỬA) Đảm bảo email khớp 100% với yêu cầu
        const techHN = staffByCenter[centerHn.id].tech;
        const staffHN = staffByCenter[centerHn.id].staff;
        const imHN = staffByCenter[centerHn.id].im;
        console.log(`  👨‍🔧 Staff HN:      ${staffHN.email}     (pass: staff123)`);
        console.log(`  🔧 Tech HN:       ${techHN.email}      (pass: tech123)`);
        console.log(`  📦 IM HN:         ${imHN.email} (pass: inventory123)`);
        
        console.log(`  👤 Customer 1:    customer1@example.com     (pass: customer123)`);
        console.log(`  👤 Customer 2:    customer2@example.com     (pass: customer123)`);

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