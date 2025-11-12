// Tệp: src/application/staff/startAppointment.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');
const ServiceRecordEntity = require('../../domain/entities/ServiceRecord');
// (THÊM) Import Enums để dùng
const { ServiceRecordStatus, AppointmentStatus } = require('@prisma/client');

class StartAppointmentProgress {
    constructor(appointmentRepo, serviceRecordRepo, prismaClient) {
        this.appointmentRepo = appointmentRepo;
        this.serviceRecordRepo = serviceRecordRepo;
        this.prisma = prismaClient;
    }

    async execute(appointmentId, staffServiceCenterId, currentMileage) {
        let updatedApptPrisma, updatedRecordPrisma; 

        await this.prisma.$transaction(async (tx) => {
            const appointment = await this.appointmentRepo.findById(appointmentId);
            if (!appointment || appointment.serviceCenterId !== staffServiceCenterId) {
                throw new Error('Appointment not found or not in your center.');
            }
            // (SỬA) Dùng Enum để so sánh trạng thái an toàn hơn
            if (appointment.status !== AppointmentStatus.CONFIRMED) {
                throw new Error('Appointment must be in CONFIRMED state to start.');
            }

            // 1. Cập nhật ServiceAppointment -> IN_PROGRESS
            updatedApptPrisma = await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.IN_PROGRESS, tx);

            // 2. TÌM ServiceRecord liên quan đến Appointment
            const record = await this.serviceRecordRepo.findByAppointmentId(appointmentId);
            if (!record) {
                throw new Error('Service record not found. Assignment might have failed.');
            }

            updatedRecordPrisma = await this.serviceRecordRepo.update(record.id, { 
                status: ServiceRecordStatus.DIAGNOSING // Chuyển sang DIAGNOSING
            }, tx);

            if (currentMileage !== undefined && currentMileage !== null) {
                const newMileage = parseInt(currentMileage, 10);
                if (!isNaN(newMileage) && newMileage >= 0) {
                    await tx.vehicle.update({
                        where: { id: appointment.vehicleId },
                        data: { currentMileage: newMileage }
                    });
                } else {
                    // Ném lỗi nếu số km không hợp lệ
                    throw new Error("Invalid mileage provided. Must be a positive number.");
                }
            }
        });

        // 5. Chuyển đổi kết quả Prisma sang Entities (Giữ nguyên)
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