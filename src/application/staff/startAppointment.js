// Tệp: src/application/staff/startAppointmentProgress.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment'); // Import
const ServiceRecordEntity = require('../../domain/entities/ServiceRecord'); // Import

class StartAppointmentProgress {
    constructor(appointmentRepo, serviceRecordRepo, prismaClient) {
        this.appointmentRepo = appointmentRepo;
        this.serviceRecordRepo = serviceRecordRepo;
        this.prisma = prismaClient;
    }

    async execute(appointmentId, staffServiceCenterId) {
        let updatedApptPrisma, updatedRecordPrisma; // Lưu kết quả Prisma

        await this.prisma.$transaction(async (tx) => {
            const appointment = await this.appointmentRepo.findById(appointmentId);
            if (!appointment || appointment.serviceCenterId !== staffServiceCenterId) {
                throw new Error('Appointment not found or not in your center.');
            }
            if (appointment.status !== 'CONFIRMED') {
                throw new Error('Appointment must be in CONFIRMED state to start.');
            }

            // 1. Cập nhật ServiceAppointment -> IN_PROGRESS
            updatedApptPrisma = await this.appointmentRepo.updateStatus(appointmentId, 'IN_PROGRESS', tx);

            // 2. Cập nhật ServiceRecord -> IN_PROGRESS
            const record = await this.serviceRecordRepo.findByAppointmentId(appointmentId);
            if (!record) {
                throw new Error('Service record not found. Assignment might have failed.');
            }
            updatedRecordPrisma = await this.serviceRecordRepo.update(record.id, { status: 'IN_PROGRESS' }, tx);
        });

        // 3. Chuyển đổi kết quả Prisma sang Entities trước khi trả về
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

        const updatedRecordEntity = new ServiceRecordEntity(
            updatedRecordPrisma.id,
            updatedRecordPrisma.appointmentId,
            updatedRecordPrisma.technicianId,
            updatedRecordPrisma.status,
            updatedRecordPrisma.startTime,
            updatedRecordPrisma.endTime,
            updatedRecordPrisma.staffNotes
        );

        return { updatedAppointment: updatedApptEntity, updatedServiceRecord: updatedRecordEntity };
    }
}
module.exports = StartAppointmentProgress;