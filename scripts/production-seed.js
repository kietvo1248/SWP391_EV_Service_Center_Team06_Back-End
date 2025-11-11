/**
 * Production seed script cho Render deployment
 * (ĐÃ VIẾT LẠI TOÀN BỘ)
 * - Sử dụng UUID tự động 100%, không dùng ID cứng (vd: 'appt-pending').
 * - Tương thích schema mới (VehicleModel, BatteryType, employeeCode, currentMileage).
 * - Tự động tạo nhân sự cứng cho TẤT CẢ các trạm.
 * - Tạo dữ liệu cho tất cả các trạng thái (Enums) bằng cách lồng (nested creates).
 */

const { PrismaClient, Prisma, Role, AppointmentStatus, ServiceRecordStatus, InvoiceStatus, PaymentStatus, RestockRequestStatus, PartUsageStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Hàm helper để tạo mật khẩu
const hashPassword = (pass) => bcrypt.hash(pass, SALT_ROUNDS);

/**
 * (MỚI) Dọn dẹp CSDL theo đúng thứ tự
 */
async function cleanupDatabase() {
    console.log('🗑️ Đang dọn dẹp CSDL...');
    // Xóa theo thứ tự phụ thuộc (từ con đến cha)
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
    
    await prisma.vehicle.deleteMany();
    
    // Xóa các bảng liên quan đến Model/Pin
    // (Bảng _BatteryTypeToVehicleModel sẽ tự động bị xóa khi 2 bảng cha bị xóa)
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
    
    // 1. Dịch vụ (Dùng createMany vì 'name' không unique và seed chạy trên DB trống)
    const serviceTypesData = [
        { name: 'Bảo dưỡng định kỳ', price: 500000 },
        { name: 'Kiểm tra Pin Cao Áp', price: 300000 },
        { name: 'Hệ thống Phanh', price: 250000 }
    ];
    await prisma.serviceType.createMany({ data: serviceTypesData });
    const serviceTypes = await prisma.serviceType.findMany();
    
    // 2. Phụ tùng (Dùng upsert vì 'sku' là @unique)
    const part_lop = await prisma.part.upsert({ 
        where: { sku: 'VF-TYRE-001' }, update: { price: 4500000 },
        create: { sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8', price: 4500000 } 
    });
    const part_locgio = await prisma.part.upsert({ 
        where: { sku: 'VF-FILTER-AC' }, update: { price: 780000 },
        create: { sku: 'VF-FILTER-AC', name: 'Lọc gió điều hòa HEPA', price: 780000 } 
    });
    const part_nuocmat = await prisma.part.upsert({ 
        where: { sku: 'VF-BAT-COOL' }, update: { price: 350000 },
        create: { sku: 'VF-BAT-COOL', name: 'Nước làm mát pin (1L)', price: 350000 } 
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

    // 4. Model (Dùng 'create' vì 'name' không unique và CSDL đã sạch)
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
        serviceTypes: serviceTypes, // Trả về mảng
        parts: [part_lop, part_locgio, part_nuocmat], // Trả về mảng
        models: [modelVF8, modelVFe34] // Trả về mảng
    };
}


async function createProductionSeedData() {
    try {
        console.log('🌱 Bắt đầu tạo dữ liệu mẫu cho production...\n');
        
        // --- 0. DỌN DẸP ---
        // (Lệnh 'pnpm db:reset' trong build command đã làm việc này,
        // nhưng chạy lại cleanupDatabase() để đảm bảo an toàn tuyệt đối)
        await cleanupDatabase();

        // --- 1. TẠO TRUNG TÂM DỊCH VỤ (2 TRẠM) ---
        console.log('🏢 Tạo 2 trung tâm dịch vụ...');
        const centerHcm = await prisma.serviceCenter.create({
            data: {
                // (Dùng ID tùy chỉnh cho Trung tâm vẫn OK)
                id: 'prod-center-hcm', 
                name: 'EV Service Center Hồ Chí Minh',
                address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                phoneNumber: '028-1111-2222',
                capacityPerSlot: 3
            }
        });
        const centerHn = await prisma.serviceCenter.create({
            data: {
                id: 'prod-center-hn',
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
        const [svt_bdk, svt_pin, svt_phanh] = serviceTypes;
        const [part_lop, part_locgio, part_nuocmat] = parts;

        // 3. TẠO KHO HÀNG CHO CÁC TRẠM
        console.log('📦 Tạo kho hàng cho các trạm...');
        for (const center of allCenters) {
            for (const part of parts) {
                await prisma.inventoryItem.create({
                    data: {
                        partId: part.id,
                        serviceCenterId: center.id,
                        quantityInStock: Math.floor(Math.random() * 41) + 10, // Random 10-50
                        minStockLevel: 5
                    }
                });
            }
        }
        console.log('✅ Đã tạo kho hàng.');

        // --- 4. TẠO TÀI KHOẢN (CỨNG VÀ CHO TỪNG TRẠM) ---
        console.log('👥 Tạo các tài khoản test...');
        
        // Admin Tổng (Dùng upsert vì email là @unique)
        const admin = await prisma.user.upsert({
            where: { email: 'admin@evservice.com' },
            update: { employeeCode: 'ADMIN001', isActive: true },
            create: { fullName: 'Admin Tổng', email: 'admin@evservice.com', passwordHash: await hashPassword('admin123'), role: Role.ADMIN, employeeCode: 'ADMIN001', isActive: true }
        });

        // Tạo nhân sự cho từng trạm
        const staffByCenter = {}; 
        
        for (const center of allCenters) {
            const suffix = center.id === 'prod-center-hcm' ? 'hcm' : 'hn';
            
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
        
        // Khách hàng (Dùng upsert)
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

        // --- 6. TẠO DỮ LIỆU CHO TỪNG TRẠNG THÁI (ENUMS) ---
        console.log('🔄 Tạo dữ liệu mẫu cho các trạng thái (Enums)...');
        const now = new Date();
        const tomorrow = new Date(new Date().setDate(now.getDate() + 1));
        const nextWeek = new Date(new Date().setDate(now.getDate() + 7));
        const lastWeek = new Date(new Date().setDate(now.getDate() - 7));
        const lastMonth = new Date(new Date().setDate(now.getDate() - 30));

        // 6.1. APPOINTMENT_PENDING (HCM)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-pending', // XÓA
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: tomorrow, status: AppointmentStatus.PENDING,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] }
            }
        });

        // 6.2. APPOINTMENT_CONFIRMED (-> ServiceRecord PENDING) (HN)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-confirmed', // XÓA
                customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: nextWeek, status: AppointmentStatus.CONFIRMED,
                requestedServices: { create: [{ serviceTypeId: svt_pin.id }] },
                serviceRecord: {
                    create: { 
                        // id: 'sr-pending', // XÓA
                        technicianId: staffByCenter[centerHn.id].tech.id, 
                        status: ServiceRecordStatus.PENDING 
                    }
                }
            }
        });

        // 6.3. APPOINTMENT_PENDING_APPROVAL (-> SR WAITING_APPROVAL, PartUsage REQUESTED, Quotation) (HCM)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-pending-approval', // XÓA
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.PENDING_APPROVAL,
                serviceRecord: {
                    create: {
                        // id: 'sr-waiting-approval', // XÓA
                        technicianId: staffByCenter[centerHcm.id].tech.id, 
                        status: ServiceRecordStatus.WAITING_APPROVAL,
                        quotation: {
                            create: { 
                                // id: 'quot-1', // XÓA
                                estimatedCost: new Prisma.Decimal(780000) 
                            }
                        },
                        partsUsed: {
                            create: { 
                                // id: 'partuse-requested', // XÓA
                                partId: part_locgio.id, 
                                quantity: 1, 
                                unitPrice: 780000, 
                                status: PartUsageStatus.REQUESTED 
                            }
                        }
                    }
                }
            }
        });

        // 6.4. APPOINTMENT_IN_PROGRESS (-> SR WAITING_PARTS) (HN)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-waiting-parts', // XÓA
                customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: lastWeek, status: AppointmentStatus.IN_PROGRESS,
                serviceRecord: {
                    create: {
                        // id: 'sr-waiting-parts', // XÓA
                        technicianId: staffByCenter[centerHn.id].tech.id, 
                        status: ServiceRecordStatus.WAITING_PARTS,
                        quotation: { create: { /*id: 'quot-2',*/ estimatedCost: 350000 } },
                        partsUsed: { create: { /*id: 'partuse-waiting',*/ partId: part_nuocmat.id, quantity: 1, unitPrice: 350000, status: PartUsageStatus.REQUESTED } }
                    }
                }
            }
        });

        // 6.5. APPOINTMENT_COMPLETED (-> SR COMPLETED, Invoice UNPAID) (HCM)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-completed-unpaid', // XÓA
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastMonth, status: AppointmentStatus.COMPLETED,
                serviceRecord: {
                    create: {
                        // id: 'sr-completed-unpaid', // XÓA
                        technicianId: staffByCenter[centerHcm.id].tech.id, 
                        status: ServiceRecordStatus.COMPLETED, 
                        endTime: lastMonth,
                        quotation: { create: { /*id: 'quot-4',*/ estimatedCost: 4500000 } },
                        partsUsed: { create: { /*id: 'partuse-issued-2',*/ partId: part_lop.id, quantity: 1, unitPrice: 4500000, status: PartUsageStatus.ISSUED } },
                        invoice: {
                            create: { 
                                // id: 'inv-unpaid', // XÓA
                                totalAmount: 4500000, 
                                dueDate: nextWeek, 
                                status: InvoiceStatus.UNPAID 
                            }
                        }
                    }
                }
            }
        });
        
        // 6.6. APPOINTMENT_COMPLETED (-> SR COMPLETED, Invoice PAID, Payment SUCCESSFUL) (HN)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-completed-paid', // XÓA
                customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: lastMonth, status: AppointmentStatus.COMPLETED,
                serviceRecord: {
                    create: {
                        // id: 'sr-completed-paid', // XÓA
                        technicianId: staffByCenter[centerHn.id].tech.id, 
                        status: ServiceRecordStatus.COMPLETED, 
                        endTime: lastMonth,
                        quotation: { create: { /*id: 'quot-5',*/ estimatedCost: 350000 } },
                        partsUsed: { create: { /*id: 'partuse-issued-3',*/ partId: part_nuocmat.id, quantity: 1, unitPrice: 350000, status: PartUsageStatus.ISSUED } },
                        invoice: {
                            create: { 
                                // id: 'inv-paid', // XÓA
                                totalAmount: 350000, 
                                dueDate: lastMonth, 
                                status: InvoiceStatus.PAID,
                                payments: {
                                    create: { 
                                        // id: 'pay-1', // XÓA
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

        // 6.7. APPOINTMENT_CANCELLED (-> SR CANCELLED) (HCM)
        await prisma.serviceAppointment.create({
            data: {
                // id: 'appt-cancelled', // XÓA
                customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.CANCELLED,
                serviceRecord: {
                    create: {
                        // id: 'sr-cancelled', // XÓA
                        technicianId: staffByCenter[centerHcm.id].tech.id, 
                        status: ServiceRecordStatus.CANCELLED,
                    }
                }
            }
        });
        console.log('✅ Đã tạo dữ liệu mẫu cho các trạng thái Lịch hẹn.');

        // 6.8. RESTOCK_REQUEST (Tất cả trạng thái, 2 trạm)
        await prisma.restockRequest.createMany({
            data: [
                // HCM
                { quantity: 10, partId: part_lop.id, inventoryManagerId: staffByCenter[centerHcm.id].im.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.PENDING },
                { quantity: 5, partId: part_locgio.id, inventoryManagerId: staffByCenter[centerHcm.id].im.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.APPROVED, adminId: staffByCenter[centerHcm.id].sa.id, processedAt: now },
                // HN
                { quantity: 20, partId: part_nuocmat.id, inventoryManagerId: staffByCenter[centerHn.id].im.id, serviceCenterId: centerHn.id, status: RestockRequestStatus.REJECTED, adminId: admin.id, processedAt: now },
                { quantity: 15, partId: part_lop.id, inventoryManagerId: staffByCenter[centerHn.id].im.id, serviceCenterId: centerHn.id, status: RestockRequestStatus.COMPLETED, adminId: staffByCenter[centerHn.id].sa.id, processedAt: lastWeek }
            ]
        });
        console.log('✅ Đã tạo dữ liệu mẫu cho các trạng thái Nhập kho.');

        console.log('\n🎉 Production seed data hoàn tất!');
        console.log('\n📋 Thông tin đăng nhập:');
        console.log(`  👤 Admin:         admin@evservice.com       (pass: admin123)`);
        console.log(`  👨‍💼 Station HCM:   station.hcm@evservice.com (pass: station123)`);
        console.log(`  👨‍🔧 Staff HCM:     staff.hcm@evservice.com     (pass: staff123)`);
        console.log(`  🔧 Tech HCM:      tech.hcm@evservice.com      (pass: tech123)`);
        console.log(`  📦 IM HCM:        inventory.hcm@evservice.com (pass: inventory123)`);
        console.log(`  👨‍💼 Station HN:    station.hn@evservice.com  (pass: station123)`);
        console.log(`  👨‍🔧 Staff HN:      staff.hn@evservice.com      (pass: staff123)`);
        console.log(`  🔧 Tech HN:       tech.hn@evservice.com       (pass: tech123)`);
        console.log(`  📦 IM HN:         inventory.hn@evservice.com  (pass: inventory123)`);
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