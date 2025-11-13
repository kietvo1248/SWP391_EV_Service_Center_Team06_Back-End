// Tệp: src/application/staff/createAppointmentAndStartWalkInAppointment.js
const { Prisma, AppointmentStatus, ServiceRecordStatus } = require('@prisma/client');
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');
const ServiceRecordEntity = require('../../domain/entities/ServiceRecord');

class CreateAndStartWalkInAppointment {
    // ... (Constructor giữ nguyên) ...
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
            appointmentDate,
            servicePackageId, // (SỬA) Đổi tên từ requestedServices
            technicianId, 
            customerNotes
        } = data;
        
        // ... (Logic Validations (customer, vehicle, technician, center, date) giữ nguyên) ...
        const staffServiceCenterId = actor.serviceCenterId;
        const appointmentDateTime = new Date(appointmentDate);
        // ...
        
        // (SỬA) Kiểm tra servicePackageId
        if (!servicePackageId) {
            throw new Error("A service package (servicePackageId) must be selected.");
        }
        
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // ... (Logic kiểm tra Slot (existingCount) giữ nguyên, nhớ xóa PENDING_APPROVAL) ...
                const center = await this.serviceCenterRepo.getServiceCenterById(staffServiceCenterId);
                const capacity = center.capacityPerSlot;
                const existingCount = await tx.serviceAppointment.count({
                    where: {
                        serviceCenterId: staffServiceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } // (SỬA)
                    }
                });

                if (existingCount >= capacity) {
                    throw new Error("This time slot is no longer available.");
                }

                // (SỬA) Kiểm tra 1 Service Type
                const validServiceType = await tx.serviceType.findUnique({
                    where: { id: servicePackageId }, select: { id: true }
                });
                if (!validServiceType) {
                    throw new Error("The selected service package is invalid.");
                }

                // 2c. Tạo ServiceAppointment (status = IN_PROGRESS) (Giữ nguyên)
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

                // 2d. (SỬA) Liên kết 1 AppointmentService
                await tx.appointmentService.create({ 
                    data: {
                        appointmentId: newAppointment.id,
                        serviceTypeId: servicePackageId,
                    } 
                });

                // 2e. (SỬA) Tạo ServiceRecord (status = IN_PROGRESS)
                const newServiceRecord = await tx.serviceRecord.create({
                    data: {
                        appointmentId: newAppointment.id,
                        technicianId: technicianId,
                        status: ServiceRecordStatus.IN_PROGRESS, // (SỬA) KTV bắt đầu làm việc
                        startTime: new Date(),
                    },
                });

                return { newAppointment, newServiceRecord };
            }, {
                isolationLevel: 'Serializable',
                // ... (maxWait, timeout giữ nguyên) ...
            });

            // 3. Trả về Entities (Giữ nguyên logic)
            // ...
            const appEntity = new ServiceAppointmentEntity(
                result.newAppointment.id,
                result.newAppointment.customerId,
                // ...
                result.newAppointment.status
            );
            
            const recordEntity = new ServiceRecordEntity(
                result.newServiceRecord.id,
                result.newServiceRecord.appointmentId,
                // ...
                result.newServiceRecord.status
            );

            return { appointment: appEntity, serviceRecord: recordEntity };

        } catch (error) {
            // ... (Error handling giữ nguyên, sửa message) ...
            if (error.message.includes("slot") || error.message.includes("service package")) {
                throw error;
            }
            throw new Error("Failed to create walk-in appointment.");
        }
    }
}
module.exports = CreateAndStartWalkInAppointment;