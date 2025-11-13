// Tệp: src/application/bookings/getAppointmentDetails.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');
const QuotationEntity = require('../../domain/entities/Quotation');
const VehicleEntity = require('../../domain/entities/Vehicle');
const UserEntity = require('../../domain/entities/User');
const ServiceTypeEntity = require('../../domain/entities/ServiceType');

class GetAppointmentDetailsUseCase {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(appointmentId, actor) {
        // 1. Lấy dữ liệu (Repo cần được sửa để include sâu hơn)
        const appointmentPrisma = await this.appointmentRepository.findById(appointmentId);

        if (!appointmentPrisma) {
            throw new Error('Appointment not found.');
        }

        // 2. Kiểm tra quyền (Logic này đã đúng)
        let hasAccess = false;
        switch (actor.role) {
            case 'CUSTOMER':
                if (appointmentPrisma.customerId === actor.id) hasAccess = true;
                break;
            case 'STAFF':
            case 'STATION_ADMIN':
            case 'TECHNICIAN':
                if (appointmentPrisma.serviceCenterId === actor.serviceCenterId) hasAccess = true;
                break;
            case 'ADMIN':
                hasAccess = true;
                break;
            default:
                hasAccess = false;
        }
        if (!hasAccess) {
            throw new Error('Forbidden. You do not have permission to access this appointment.');
        }

        // 3. Chuyển đổi Appointment Entity chính
        const appointmentEntity = new ServiceAppointmentEntity(
            appointmentPrisma.id,
            appointmentPrisma.customerId,
            appointmentPrisma.vehicleId,
            appointmentPrisma.serviceCenterId,
            appointmentPrisma.appointmentDate,
            appointmentPrisma.status,
            appointmentPrisma.customerNotes,
            appointmentPrisma.createdAt
        );

        // 4. Chuyển đổi và gán các Entities liên quan
        
        // (SỬA) Logic này sẽ hoạt động sau khi VehicleEntity (Bước 1) được sửa
        if (appointmentPrisma.vehicle) { 
            appointmentEntity.vehicle = new VehicleEntity(appointmentPrisma.vehicle);
        }

        // --- SỬA LỖI 'userCode' ---
        if (appointmentPrisma.customer) { 
            appointmentEntity.customer = new UserEntity(
                appointmentPrisma.customer.id,
                appointmentPrisma.customer.employeeCode, // Sửa từ userCode
                appointmentPrisma.customer.fullName,
                appointmentPrisma.customer.email,
                null, // passwordHash
                appointmentPrisma.customer.role,
                appointmentPrisma.customer.phoneNumber,
                appointmentPrisma.customer.address, // (SỬA) Thêm address
                appointmentPrisma.customer.serviceCenterId, // (SỬA) Thêm serviceCenterId
                null, // googleId
                appointmentPrisma.customer.isActive // (SỬA) Thêm isActive
            );
        }
        // --- KẾT THÚC SỬA LỖI ---

        appointmentEntity.serviceCenterName = appointmentPrisma.serviceCenter?.name;

        // --- SỬA LỖI 'price' ---
        if (appointmentPrisma.requestedServices && appointmentPrisma.requestedServices.length > 0) {
            appointmentEntity.requestedServices = appointmentPrisma.requestedServices.map(rs => {
                if (rs.serviceType) {
                     return new ServiceTypeEntity(
                         rs.serviceType.id,
                         rs.serviceType.name,
                         rs.serviceType.description,
                         rs.serviceType.price // (SỬA) Thêm price
                     );
                }
                return null;
            }).filter(st => st !== null);
        } else {
             appointmentEntity.requestedServices = [];
        }
        // --- KẾT THÚC SỬA LỖI ---

        if (appointmentPrisma.serviceRecord && appointmentPrisma.serviceRecord.quotation) {
            const quotePrisma = appointmentPrisma.serviceRecord.quotation;
            appointmentEntity.quotation = new QuotationEntity(
                quotePrisma.id,
                quotePrisma.serviceRecordId,
                quotePrisma.estimatedCost,
                quotePrisma.creationDate
            );
        }

        return appointmentEntity;
    }
}
module.exports = GetAppointmentDetailsUseCase;