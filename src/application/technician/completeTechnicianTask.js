// Tệp: src/application/technician/completeTechnicianTask.js
const { Prisma, ServiceRecordStatus, AppointmentStatus } = require('@prisma/client');
const ServiceRecordEntity = require('../../domain/entities/ServiceRecord');
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');

class CompleteTechnicianTask {
    constructor(serviceRecordRepo, appointmentRepo, prismaClient) {
        this.serviceRecordRepo = serviceRecordRepo;
        this.appointmentRepo = appointmentRepo;
        this.prisma = prismaClient;
    }

    /**
     * Kỹ thuật viên đánh dấu công việc hoàn thành
     * @param {string} serviceRecordId ID của Service Record
     * @param {string} technicianId ID của KTV đang thực hiện
     * @param {string} completionNotes Ghi chú khi hoàn thành (tùy chọn)
     */
    async execute(serviceRecordId, technicianId, completionNotes) {
        let updatedRecordPrisma, updatedApptPrisma;

        await this.prisma.$transaction(async (tx) => {
            // 1. Kiểm tra Service Record
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record) {
                throw new Error('Service record not found.');
            }
            if (record.technicianId !== technicianId) {
                throw new Error('Forbidden. You are not assigned to this task.');
            }
            
            // (SỬA) Chỉ cho phép hoàn thành từ IN_PROGRESS (theo luồng mới)
            if (record.status !== ServiceRecordStatus.IN_PROGRESS) {
                 throw new Error(`Cannot complete task from current status: ${record.status}. Must be IN_PROGRESS.`);
            }

            // 2. Cập nhật Service Record
            const updateData = {
                status: ServiceRecordStatus.COMPLETED,
                endTime: new Date(),
            };
            
            // Nối ghi chú (nếu có)
            if (completionNotes) {
                updateData.staffNotes = record.staffNotes
                    ? `${record.staffNotes}\n[COMPLETED]: ${completionNotes}`
                    : `[COMPLETED]: ${completionNotes}`;
            } else {
                 updateData.staffNotes = record.staffNotes ? `${record.staffNotes}\n[COMPLETED]` : `[COMPLETED]`;
            }

            updatedRecordPrisma = await this.serviceRecordRepo.update(serviceRecordId, updateData, tx);

            // 3. Cập nhật Appointment
            updatedApptPrisma = await this.appointmentRepo.updateStatus(record.appointmentId, AppointmentStatus.COMPLETED, tx);
        });

         // 4. Chuyển đổi sang Entities
         const updatedRecordEntity = new ServiceRecordEntity(
            updatedRecordPrisma.id,
            updatedRecordPrisma.appointmentId,
            updatedRecordPrisma.technicianId,
            updatedRecordPrisma.status,
            updatedRecordPrisma.startTime,
            updatedRecordPrisma.endTime,
            updatedRecordPrisma.staffNotes
        );
         const updatedApptEntity = new ServiceAppointmentEntity(
            updatedApptPrisma.id,
            updatedApptPrisma.customerId,
            updatedApptPrisma.vehicleId,
            updatedApptPrisma.serviceCenterId,
            updatedApptPrisma.appointmentDate,
            updatedApptPrisma.status,
            updatedApptPrisma.customerNotes,
            updatedApptPrisma.createdAt
        );

        return { serviceRecord: updatedRecordEntity, appointment: updatedApptEntity };
    }
}
module.exports = CompleteTechnicianTask;