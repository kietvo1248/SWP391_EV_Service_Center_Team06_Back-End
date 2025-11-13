// Tệp: src/application/staff/startAppointment.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment');
// const ServiceRecordEntity = require('../../domain/entities/ServiceRecord'); // (KHÔNG CẦN NỮA)
const { AppointmentStatus } = require('@prisma/client'); // (CHỈ CẦN AppointmentStatus)

class StartAppointmentProgress {
    // (SỬA) Bỏ serviceRecordRepo
    constructor(appointmentRepo, /* serviceRecordRepo, */ prismaClient) {
        this.appointmentRepo = appointmentRepo;
        // this.serviceRecordRepo = serviceRecordRepo; // (XÓA)
        this.prisma = prismaClient;
    }

    async execute(appointmentId, staffServiceCenterId, currentMileage) {
        let updatedApptPrisma; 
        // let updatedRecordPrisma; // (XÓA)

        await this.prisma.$transaction(async (tx) => {
            const appointment = await this.appointmentRepo.findById(appointmentId);
            if (!appointment || appointment.serviceCenterId !== staffServiceCenterId) {
                throw new Error('Appointment not found or not in your center.');
            }
            if (appointment.status !== AppointmentStatus.CONFIRMED) {
                throw new Error('Appointment must be in CONFIRMED state to start.');
            }

            // 1. Chỉ cập nhật ServiceAppointment -> IN_PROGRESS
            updatedApptPrisma = await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.IN_PROGRESS, tx);

            // (XÓA) Không cập nhật ServiceRecord ở đây
            // const record = await this.serviceRecordRepo.findByAppointmentId(appointmentId);
            // updatedRecordPrisma = await this.serviceRecordRepo.update(record.id, { 
            //     status: ServiceRecordStatus.DIAGNOSING // (XÓA)
            // }, tx);

            // Cập nhật Mileage (Giữ nguyên)
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

        // 5. (SỬA) Chỉ trả về Appointment Entity
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

        // (SỬA) Bỏ updatedServiceRecord
        return { updatedAppointment: updatedApptEntity };
    }
}
module.exports = StartAppointmentProgress;