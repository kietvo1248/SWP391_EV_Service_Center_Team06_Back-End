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
        // 1. Lấy dữ liệu
        const appointmentPrisma = await this.appointmentRepository.findById(appointmentId);

        if (!appointmentPrisma) {
            throw new Error('Appointment not found.');
        }

        // 2. Kiểm tra quyền
        let hasAccess = false;
        switch (actor.role) {
            case 'CUSTOMER':
                if (appointmentPrisma.customerId === actor.id) {
                    hasAccess = true;
                }
                break;
            case 'STAFF':
            case 'STATION_ADMIN':
            case 'TECHNICIAN':
                if (appointmentPrisma.serviceCenterId === actor.serviceCenterId) {
                    hasAccess = true;
                }
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
        if (appointmentPrisma.vehicle) { // Kiểm tra vehicle
            appointmentEntity.vehicle = new VehicleEntity(appointmentPrisma.vehicle);
        }

        if (appointmentPrisma.customer) { // <-- Thêm kiểm tra này
            appointmentEntity.customerId = new UserEntity(
                appointmentPrisma.customer.id,
                appointmentPrisma.customer.userCode,
                appointmentPrisma.customer.fullName,
                appointmentPrisma.customer.email,
                appointmentPrisma.customer.role,
                appointmentPrisma.customer.phoneNumber,
                null // serviceCenterId của customer là null
            );
        }

        appointmentEntity.serviceCenterName = appointmentPrisma.serviceCenter?.name;

        if (appointmentPrisma.requestedServices && appointmentPrisma.requestedServices.length > 0) {
            appointmentEntity.requestedServices = appointmentPrisma.requestedServices.map(rs => {
                if (rs.serviceType) {
                     return new ServiceTypeEntity(
                         rs.serviceType.id,
                         rs.serviceType.name,
                         rs.serviceType.description
                     );
                }
                return null;
            }).filter(st => st !== null);
        } else {
             appointmentEntity.requestedServices = [];
        }

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