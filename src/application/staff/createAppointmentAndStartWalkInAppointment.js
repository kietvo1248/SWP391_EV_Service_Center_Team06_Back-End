const { Prisma, AppointmentStatus, ServiceRecordStatus } = require('@prisma/client');
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');
const ServiceRecordEntity = require('../../domain/entities/ServiceRecord');

class CreateAndStartWalkInAppointment {
    constructor(
        appointmentRepo,
        serviceRecordRepo,
        userRepo,
        serviceCenterRepo,
        vehicleRepo,
        prismaClient
    ) {
        this.appointmentRepo = appointmentRepo;
        this.serviceRecordRepo = serviceRecordRepo;
        this.userRepo = userRepo;
        this.serviceCenterRepo = serviceCenterRepo;
        this.vehicleRepo = vehicleRepo;
        this.prisma = prismaClient;
    }

    async execute(data, actor) {
        const {
            customerId,
            vehicleId,
            appointmentDate, // Slot khách chọn (có thể là bây giờ)
            requestedServices, // Mảng ID dịch vụ
            technicianId, // KTV được phân công
            customerNotes
        } = data;
        
        const staffServiceCenterId = actor.serviceCenterId;
        const appointmentDateTime = new Date(appointmentDate);

        // --- 1. VALIDATIONS ---
        // (Logic validations của bạn giữ nguyên, đã rất tốt)
        const [customer, vehicle, technician, center] = await Promise.all([
            this.userRepo.findById(customerId),
            this.vehicleRepo.findById(vehicleId, customerId),
            this.userRepo.findById(technicianId),
            this.serviceCenterRepo.getServiceCenterById(staffServiceCenterId)
        ]);

        if (!customer || customer.role !== 'CUSTOMER') {
            throw new Error('Customer not found.');
        }
        if (!vehicle) {
            throw new Error('Vehicle not found or does not belong to this customer.');
        }
        if (!technician || technician.role !== 'TECHNICIAN' || technician.serviceCenterId !== staffServiceCenterId) {
            throw new Error('Invalid technician or technician does not belong to this center.');
        }
        if (!center) {
            throw new Error('Service center not found.');
        }
        if (isNaN(appointmentDateTime.getTime())) {
            throw new Error("Invalid appointment date.");
        }
        if (!requestedServices || requestedServices.length === 0) {
            throw new Error("At least one service must be selected.");
        }
        
        // --- 2. TRANSACTION (ĐÃ SỬA LỖI RACE CONDITION) ---
        try {
            // Thêm { isolationLevel: 'Serializable' }
            const result = await this.prisma.$transaction(async (tx) => {
                // 2a. Kiểm tra Slot
                const capacity = center.capacityPerSlot;
                const existingCount = await tx.serviceAppointment.count({
                    where: {
                        serviceCenterId: staffServiceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'PENDING_APPROVAL'] }
                    }
                });

                if (existingCount >= capacity) {
                    throw new Error("This time slot is no longer available.");
                }

                // 2b. Kiểm tra Service Types
                const validServiceTypes = await tx.serviceType.findMany({
                    where: { id: { in: requestedServices } }, select: { id: true }
                });
                if (validServiceTypes.length !== requestedServices.length) {
                    throw new Error("One or more requested service types are invalid.");
                }

                // 2c. Tạo ServiceAppointment (status = IN_PROGRESS)
                const newAppointment = await tx.serviceAppointment.create({
                    data: {
                        customerId: customerId,
                        vehicleId: vehicleId,
                        serviceCenterId: staffServiceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: AppointmentStatus.IN_PROGRESS, // Bắt đầu ngay
                        customerNotes: customerNotes,
                    },
                });

                // 2d. Liên kết AppointmentService
                const servicesToLink = requestedServices.map(serviceTypeId => ({
                    appointmentId: newAppointment.id,
                    serviceTypeId: serviceTypeId,
                }));
                await tx.appointmentService.createMany({ data: servicesToLink });

                // 2e. Tạo ServiceRecord (status = DIAGNOSING)
                const newServiceRecord = await tx.serviceRecord.create({
                    data: {
                        appointmentId: newAppointment.id,
                        technicianId: technicianId,
                        status: ServiceRecordStatus.DIAGNOSING, // KTV bắt đầu khám
                        startTime: new Date(),
                    },
                });

                return { newAppointment, newServiceRecord };
            }, {
                // Đây là dòng quan trọng nhất để sửa lỗi
                isolationLevel: 'Serializable',
                maxWait: 5000,
                timeout: 10000
            });
            // --- KẾT THÚC SỬA LỖI ---

            // 3. Trả về Entities (Giữ nguyên logic)
            const appEntity = new ServiceAppointmentEntity(
                result.newAppointment.id,
                result.newAppointment.customerId,
                result.newAppointment.vehicleId,
                result.newAppointment.serviceCenterId,
                result.newAppointment.appointmentDate,
                result.newAppointment.status,
                result.newAppointment.customerNotes,
                result.newAppointment.createdAt
            );
            
            const recordEntity = new ServiceRecordEntity(
                result.newServiceRecord.id,
                result.newServiceRecord.appointmentId,
                result.newServiceRecord.technicianId,
                result.newServiceRecord.status,
                result.newServiceRecord.startTime,
                null, null
            );

            return { appointment: appEntity, serviceRecord: recordEntity };

        } catch (error) {
            console.error("Error creating walk-in appointment:", error.message);
            if (error.message.includes("slot") || error.message.includes("service types") || error.message.includes("technician") || error instanceof Prisma.PrismaClientKnownRequestError) {
                throw error;
            }
            throw new Error("Failed to create walk-in appointment.");
        }
    }
}
module.exports = CreateAndStartWalkInAppointment;