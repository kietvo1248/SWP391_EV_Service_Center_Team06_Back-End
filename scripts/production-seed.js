/**
 * Production seed script cho Render deployment
 * (ĐÃ VIẾT LẠI)
 * - Tương thích schema mới (VehicleModel, BatteryType, employeeCode)
 * - Tạo dữ liệu cho 2 trạm
 * - Tạo dữ liệu cho tất cả các trạng thái (Enums)
 */

const { PrismaClient, Prisma, Role, AppointmentStatus, ServiceRecordStatus, InvoiceStatus, PaymentStatus, RestockRequestStatus, PartUsageStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Hàm helper để tạo mật khẩu
const hashPassword = (pass) => bcrypt.hash(pass, SALT_ROUNDS);

async function createProductionSeedData() {
    try {
        console.log('🌱 Bắt đầu tạo dữ liệu mẫu cho production...\n');

        // --- 1. TẠO TRUNG TÂM DỊCH VỤ (2 TRẠM) ---
        console.log('🏢 Tạo 2 trung tâm dịch vụ...');
        const centerHcm = await prisma.serviceCenter.upsert({
            where: { id: 'prod-center-hcm' },
            update: {},
            create: {
                id: 'prod-center-hcm',
                name: 'EV Service Center Hồ Chí Minh',
                address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                phoneNumber: '028-1111-2222',
                capacityPerSlot: 3
            }
        });
        const centerHn = await prisma.serviceCenter.upsert({
            where: { id: 'prod-center-hn' },
            update: {},
            create: {
                id: 'prod-center-hn',
                name: 'EV Service Center Hà Nội',
                address: '55 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
                phoneNumber: '024-3333-4444',
                capacityPerSlot: 2
            }
        });
        console.log(`✅ Đã tạo: ${centerHcm.name}, ${centerHn.name}`);

        // --- 2. TẠO TÀI KHOẢN (CHO CẢ 2 TRẠM) ---
        console.log('👥 Tạo các tài khoản test...');
        const admin = await prisma.user.upsert({
            where: { email: 'admin@evservice.com' }, update: {},
            create: { fullName: 'Admin Tổng', email: 'admin@evservice.com', passwordHash: await hashPassword('admin123'), role: Role.ADMIN, employeeCode: 'ADMIN001' }
        });
        // Trạm HCM
        const sa_hcm = await prisma.user.upsert({
            where: { email: 'station.hcm@evservice.com' }, update: {},
            create: { fullName: 'Trưởng trạm HCM', email: 'station.hcm@evservice.com', passwordHash: await hashPassword('station123'), role: Role.STATION_ADMIN, employeeCode: 'SA_HCM001', serviceCenterId: centerHcm.id }
        });
        const staff_hcm = await prisma.user.upsert({
            where: { email: 'staff.hcm@evservice.com' }, update: {},
            create: { fullName: 'Nhân viên HCM', email: 'staff.hcm@evservice.com', passwordHash: await hashPassword('staff123'), role: Role.STAFF, employeeCode: 'STAFF_HCM001', serviceCenterId: centerHcm.id }
        });
        const tech_hcm = await prisma.user.upsert({
            where: { email: 'tech.hcm@evservice.com' }, update: {},
            create: { fullName: 'Kỹ thuật viên HCM', email: 'tech.hcm@evservice.com', passwordHash: await hashPassword('tech123'), role: Role.TECHNICIAN, employeeCode: 'TECH_HCM001', serviceCenterId: centerHcm.id }
        });
        const im_hcm = await prisma.user.upsert({
            where: { email: 'inventory.hcm@evservice.com' }, update: {},
            create: { fullName: 'Quản lý kho HCM', email: 'inventory.hcm@evservice.com', passwordHash: await hashPassword('inventory123'), role: Role.INVENTORY_MANAGER, employeeCode: 'IM_HCM001', serviceCenterId: centerHcm.id }
        });
        // Trạm HN
        const sa_hn = await prisma.user.upsert({
            where: { email: 'station.hn@evservice.com' }, update: {},
            create: { fullName: 'Trưởng trạm HN', email: 'station.hn@evservice.com', passwordHash: await hashPassword('station123'), role: Role.STATION_ADMIN, employeeCode: 'SA_HN001', serviceCenterId: centerHn.id }
        });
        // Khách hàng
        const customer1 = await prisma.user.upsert({
            where: { email: 'customer1@example.com' }, update: {},
            create: { fullName: 'Khách hàng 001', email: 'customer1@example.com', passwordHash: await hashPassword('customer123'), role: Role.CUSTOMER }
        });
        const customer2 = await prisma.user.upsert({
            where: { email: 'customer2@example.com' }, update: {},
            create: { fullName: 'Khách hàng 002', email: 'customer2@example.com', passwordHash: await hashPassword('customer123'), role: Role.CUSTOMER }
        });
        console.log('✅ Đã tạo các tài khoản.');

        // --- 3. TẠO DỮ LIỆU GỐC (Service Types, Parts, Models, Batteries) ---
        console.log('🔧 Tạo Dữ liệu Gốc (Dịch vụ, Phụ tùng, Model, Pin)...');
        // Dịch vụ
        const svt_bdk = await prisma.serviceType.upsert({ where: { id: 'svt-bdk' }, update: {}, create: { id: 'svt-bdk', name: 'Bảo dưỡng định kỳ', price: 500000 } });
        const svt_pin = await prisma.serviceType.upsert({ where: { id: 'svt-pin' }, update: {}, create: { id: 'svt-pin', name: 'Kiểm tra Pin Cao Áp', price: 300000 } });
        const svt_phanh = await prisma.serviceType.upsert({ where: { id: 'svt-phanh' }, update: {}, create: { id: 'svt-phanh', name: 'Hệ thống Phanh', price: 250000 } });
        // Phụ tùng
        const part_lop = await prisma.part.upsert({ where: { id: 'part-lop' }, update: {}, create: { id: 'part-lop', sku: 'VF-TYRE-001', name: 'Lốp VinFast VF8', price: 4500000 } });
        const part_locgio = await prisma.part.upsert({ where: { id: 'part-filter' }, update: {}, create: { id: 'part-filter', sku: 'VF-FILTER-AC', name: 'Lọc gió điều hòa HEPA', price: 780000 } });
        const part_nuocmat = await prisma.part.upsert({ where: { id: 'part-cool' }, update: {}, create: { id: 'part-cool', sku: 'VF-BAT-COOL', name: 'Nước làm mát pin (1L)', price: 350000 } });
        
        // Kho hàng (cho cả 2 trạm)
        await prisma.inventoryItem.createMany({
            data: [
                { partId: part_lop.id, serviceCenterId: centerHcm.id, quantityInStock: 20, minStockLevel: 5 },
                { partId: part_locgio.id, serviceCenterId: centerHcm.id, quantityInStock: 50, minStockLevel: 10 },
                { partId: part_nuocmat.id, serviceCenterId: centerHcm.id, quantityInStock: 30, minStockLevel: 10 },
                { partId: part_lop.id, serviceCenterId: centerHn.id, quantityInStock: 15, minStockLevel: 5 },
                { partId: part_locgio.id, serviceCenterId: centerHn.id, quantityInStock: 40, minStockLevel: 10 },
            ],
            skipDuplicates: true
        });

        // Pin (Dùng 'name' làm where, BỎ 'id' cứng)
        const battery90 = await prisma.batteryType.upsert({
            where: { name: 'Pin LFP 90kWh (Thuê)' }, update: {},
            create: { name: 'Pin LFP 90kWh (Thuê)', capacityKwh: 90 },
        });
        const battery77 = await prisma.batteryType.upsert({
            where: { name: 'Pin LFP 77kWh (VF e34)' }, update: {},
            create: { name: 'Pin LFP 77kWh (VF e34)', capacityKwh: 77 },
        });

        // Model (Dùng 'name' làm where, BỎ 'id' cứng)
        // (Sử dụng 'create' để tránh lỗi 'upsert' nếu 'name' không unique)
        await prisma.vehicleModel.deleteMany({ where: { name: { in: ['VF8', 'VF e34'] } } }); // Dọn dẹp trước
        const modelVF8 = await prisma.vehicleModel.create({
            data: { brand: 'VinFast', name: 'VF8', compatibleBatteries: { connect: [{ id: battery90.id }] } },
            include: { compatibleBatteries: true }
        });
        const modelVFe34 = await prisma.vehicleModel.create({
            data: { brand: 'VinFast', name: 'VF e34', compatibleBatteries: { connect: [{ id: battery77.id }] } },
            include: { compatibleBatteries: true }
        });
        console.log('✅ Đã tạo Dữ liệu Gốc.');

        // --- 4. TẠO XE (Sử dụng schema mới) ---
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

        // --- 5. TẠO DỮ LIỆU CHO TỪNG TRẠNG THÁI (ENUMS) ---
        console.log('🔄 Tạo dữ liệu mẫu cho các trạng thái (Enums)...');
        const now = new Date();
        const tomorrow = new Date(now.setDate(now.getDate() + 1));
        const nextWeek = new Date(now.setDate(now.getDate() + 7));
        const lastWeek = new Date(now.setDate(now.getDate() - 14));

        // 5.1. APPOINTMENT_PENDING
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-pending', customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: tomorrow, status: AppointmentStatus.PENDING,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] }
            }
        });

        // 5.2. APPOINTMENT_CONFIRMED (-> ServiceRecord PENDING)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-confirmed', customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: nextWeek, status: AppointmentStatus.CONFIRMED,
                requestedServices: { create: [{ serviceTypeId: svt_bdk.id }] },
                serviceRecord: {
                    create: { id: 'sr-pending', technicianId: tech_hcm.id, status: ServiceRecordStatus.PENDING }
                }
            }
        });

        // 5.3. APPOINTMENT_PENDING_APPROVAL (-> SR WAITING_APPROVAL, PartUsage REQUESTED, Quotation)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-pending-approval', customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: lastWeek, status: AppointmentStatus.PENDING_APPROVAL,
                serviceRecord: {
                    create: {
                        id: 'sr-waiting-approval', technicianId: tech_hcm.id, status: ServiceRecordStatus.WAITING_APPROVAL,
                        quotation: {
                            create: { id: 'quot-1', estimatedCost: new Prisma.Decimal(780000) }
                        },
                        partsUsed: {
                            create: { id: 'partuse-requested', partId: part_locgio.id, quantity: 1, unitPrice: 780000, status: PartUsageStatus.REQUESTED }
                        }
                    }
                }
            }
        });

        // 5.4. APPOINTMENT_IN_PROGRESS (-> SR WAITING_PARTS)
        // (Tương tự 5.3, nhưng khách đã duyệt)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-waiting-parts', customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.IN_PROGRESS,
                serviceRecord: {
                    create: {
                        id: 'sr-waiting-parts', technicianId: tech_hcm.id, status: ServiceRecordStatus.WAITING_PARTS,
                        quotation: { create: { id: 'quot-2', estimatedCost: 350000 } },
                        partsUsed: { create: { id: 'partuse-waiting', partId: part_nuocmat.id, quantity: 1, unitPrice: 350000, status: PartUsageStatus.REQUESTED } }
                    }
                }
            }
        });

        // 5.5. APPOINTMENT_IN_PROGRESS (-> SR REPAIRING, PartUsage ISSUED)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-repairing', customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: lastWeek, status: AppointmentStatus.IN_PROGRESS,
                serviceRecord: {
                    create: {
                        id: 'sr-repairing', technicianId: tech_hcm.id, status: ServiceRecordStatus.REPAIRING,
                        quotation: { create: { id: 'quot-3', estimatedCost: 4500000 } },
                        partsUsed: { create: { id: 'partuse-issued', partId: part_lop.id, quantity: 1, unitPrice: 4500000, status: PartUsageStatus.ISSUED } }
                    }
                }
            }
        });

        // 5.6. APPOINTMENT_COMPLETED (-> SR COMPLETED, Invoice UNPAID)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-completed-unpaid', customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.COMPLETED,
                serviceRecord: {
                    create: {
                        id: 'sr-completed-unpaid', technicianId: tech_hcm.id, status: ServiceRecordStatus.COMPLETED,
                        quotation: { create: { id: 'quot-4', estimatedCost: 780000 } },
                        partsUsed: { create: { id: 'partuse-issued-2', partId: part_locgio.id, quantity: 1, unitPrice: 780000, status: PartUsageStatus.ISSUED } },
                        invoice: {
                            create: { id: 'inv-unpaid', totalAmount: 780000, dueDate: nextWeek, status: InvoiceStatus.UNPAID }
                        }
                    }
                }
            }
        });
        
        // 5.7. APPOINTMENT_COMPLETED (-> SR COMPLETED, Invoice PAID, Payment SUCCESSFUL)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-completed-paid', customerId: customer2.id, vehicleId: vehicle2.id, serviceCenterId: centerHn.id,
                appointmentDate: lastWeek, status: AppointmentStatus.COMPLETED,
                serviceRecord: {
                    create: {
                        id: 'sr-completed-paid', technicianId: tech_hcm.id, status: ServiceRecordStatus.COMPLETED,
                        quotation: { create: { id: 'quot-5', estimatedCost: 350000 } },
                        partsUsed: { create: { id: 'partuse-issued-3', partId: part_nuocmat.id, quantity: 1, unitPrice: 350000, status: PartUsageStatus.ISSUED } },
                        invoice: {
                            create: { 
                                id: 'inv-paid', totalAmount: 350000, dueDate: lastWeek, status: InvoiceStatus.PAID,
                                payments: {
                                    create: { id: 'pay-1', paymentMethod: 'CASH', status: PaymentStatus.SUCCESSFUL, paymentDate: lastWeek }
                                }
                            }
                        }
                    }
                }
            }
        });

        // 5.8. APPOINTMENT_CANCELLED (-> SR CANCELLED, PartUsage CANCELLED)
        await prisma.serviceAppointment.create({
            data: {
                id: 'appt-cancelled', customerId: customer1.id, vehicleId: vehicle1.id, serviceCenterId: centerHcm.id,
                appointmentDate: lastWeek, status: AppointmentStatus.CANCELLED,
                serviceRecord: {
                    create: {
                        id: 'sr-cancelled', technicianId: tech_hcm.id, status: ServiceRecordStatus.CANCELLED,
                        quotation: { create: { id: 'quot-6', estimatedCost: 4500000 } },
                        partsUsed: { create: { id: 'partuse-cancelled', partId: part_lop.id, quantity: 1, unitPrice: 4500000, status: PartUsageStatus.CANCELLED } }
                    }
                }
            }
        });
        console.log('✅ Đã tạo dữ liệu mẫu cho các trạng thái Lịch hẹn.');

        // 5.9. RESTOCK_REQUEST (Tất cả trạng thái)
        await prisma.restockRequest.createMany({
            data: [
                { id: 'rr-pending', quantity: 10, partId: part_lop.id, inventoryManagerId: im_hcm.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.PENDING },
                { id: 'rr-approved', quantity: 5, partId: part_locgio.id, inventoryManagerId: im_hcm.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.APPROVED, adminId: sa_hcm.id, processedAt: now },
                { id: 'rr-rejected', quantity: 20, partId: part_nuocmat.id, inventoryManagerId: im_hcm.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.REJECTED, adminId: admin.id, processedAt: now },
                { id: 'rr-completed', quantity: 15, partId: part_lop.id, inventoryManagerId: im_hcm.id, serviceCenterId: centerHcm.id, status: RestockRequestStatus.COMPLETED, adminId: sa_hcm.id, processedAt: lastWeek }
            ]
        });
        console.log('✅ Đã tạo dữ liệu mẫu cho các trạng thái Nhập kho.');

        console.log('\n🎉 Production seed data hoàn tất!');
        console.log('\n📋 Thông tin đăng nhập:');
        console.log('  👤 Admin:         admin@evservice.com     (pass: admin123)');
        console.log('  👨‍💼 Station HCM:   station.hcm@evservice.com (pass: station123)');
        console.log('  👨‍💼 Station HN:    station.hn@evservice.com  (pass: station123)');
        console.log('  👨‍🔧 Staff HCM:     staff.hcm@evservice.com   (pass: staff123)');
        console.log('  🔧 Tech HCM:      tech.hcm@evservice.com    (pass: tech123)');
        console.log('  📦 IM HCM:        inventory.hcm@evservice.com (pass: inventory123)');
        console.log('  👤 Customer 1:    customer1@example.com   (pass: customer123)');
        console.log('  👤 Customer 2:    customer2@example.com   (pass: customer123)');

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