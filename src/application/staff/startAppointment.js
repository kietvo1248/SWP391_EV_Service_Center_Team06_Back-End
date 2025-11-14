// Tệp: src/application/staff/startAppointment.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');
const { Prisma, ServiceRecordStatus, AppointmentStatus } = require('@prisma/client');

class StartAppointmentProgress {
    constructor(appointmentRepo, prismaClient) {
        this.appointmentRepo = appointmentRepo;
        this.prisma = prismaClient;
    }

    async execute(appointmentId, staffServiceCenterId, currentMileage) {
        // let updatedApptPrisma; // (XÓA)

        const appointment = await this.appointmentRepo.findById(appointmentId);
        if (!appointment || appointment.serviceCenterId !== staffServiceCenterId) {
            throw new Error('Appointment not found or not in your center.');
        }
        if (appointment.status !== AppointmentStatus.CONFIRMED) {
            throw new Error('Appointment must be in CONFIRMED state to start.');
        }

        await this.prisma.$transaction(async (tx) => {
            // 1. Cập nhật ServiceAppointment -> IN_PROGRESS
            await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.IN_PROGRESS, tx);

            // 2. Cập nhật Mileage (Giữ nguyên)
            if (currentMileage !== undefined && currentMileage !== null) {
                const newMileage = parseInt(currentMileage, 10);
                if (!isNaN(newMileage) && newMileage >= 0) {
                    await tx.vehicle.update({
                        where: { id: appointment.vehicleId },
                        data: { currentMileage: newMileage }
                    });
                } else {
                    throw new Error("Invalid mileage provided. Must be a positive number.");
                }
            }
        });

        // 5. (SỬA) Lấy lại dữ liệu đầy đủ (full data) sau khi update
        const fullUpdatedAppointment = await this.appointmentRepo.findById(appointmentId);

        return { updatedAppointment: fullUpdatedAppointment }; // (SỬA)
    }
}
module.exports = StartAppointmentProgress;