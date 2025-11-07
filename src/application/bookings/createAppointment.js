// Tệp: src/application/bookings/createAppointment.js
const ServiceAppointment = require('../../domain/entities/ServiceAppointment');
const { Prisma, AppointmentStatus } = require('@prisma/client'); // Import Prisma (cho lỗi)

class CreateAppointmentUseCase {
    constructor(appointmentRepository, vehicleRepository, serviceCenterRepository, prismaClient) {
        this.appointmentRepository = appointmentRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceCenterRepository = serviceCenterRepository;
        this.prisma = prismaClient; 
    }

    async execute(appointmentData, customerId) {
        const {
            vehicleId,
            appointmentDate,
            serviceCenterId,
            customerNotes,
            requestedServices
        } = appointmentData;

        // --- VALIDATIONS 
        const vehicle = await this.vehicleRepository.findByIdAndOwner(vehicleId, customerId);
        if (!vehicle) {
            throw new Error("Vehicle not found or you are not the owner.");
        }
        const appointmentDateTime = new Date(appointmentDate);
        if (isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
            throw new Error("Appointment date must be a valid date in the future.");
        }

        // --- KIỂM TRA SLOT TRONG TRANSACTION ---
        try {
            const center = await this.serviceCenterRepository.getServiceCenterById(serviceCenterId);
            if (!center) {
                throw new Error("Service center not found.");
            }
            const capacity = center.capacityPerSlot;

            // --- SỬA LỖI RACE CONDITION: Thêm { isolationLevel: 'Serializable' } ---
            const newAppointment = await this.prisma.$transaction(async (tx) => {
                // Đếm số lịch hẹn
                const existingCount = await tx.serviceAppointment.count({
                    where: {
                        serviceCenterId: serviceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: {
                            in: [
                                AppointmentStatus.PENDING,
                                AppointmentStatus.CONFIRMED,
                                AppointmentStatus.IN_PROGRESS,
                                AppointmentStatus.PENDING_APPROVAL
                            ]
                        }
                    }
                });

                // Nếu đã đủ slot -> Ném lỗi để rollback
                if (existingCount >= capacity) {
                    throw new Error("This time slot is no longer available.");
                }

                // Nếu còn slot -> Tạo lịch hẹn
                 const createdAppt = await tx.serviceAppointment.create({
                    data: {
                        customerId: customerId,
                        vehicleId: vehicleId,
                        serviceCenterId: serviceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: AppointmentStatus.PENDING,
                        customerNotes: customerNotes,
                    },
                });

                 // Liên kết services nếu có
                if (requestedServices && requestedServices.length > 0) {
                    const validServiceTypes = await tx.serviceType.findMany({
                        where: { id: { in: requestedServices } },
                        select: { id: true }
                    });
                    if (validServiceTypes.length !== requestedServices.length) {
                        throw new Error("One or more requested service types are invalid.");
                    }
                    
                    const servicesToLink = requestedServices.map(serviceTypeId => ({
                        appointmentId: createdAppt.id,
                        serviceTypeId: serviceTypeId,
                    }));
                    await tx.appointmentService.createMany({
                        data: servicesToLink,
                    });
                }
                return createdAppt; 
            }, {
                isolationLevel: 'Serializable',
                maxWait: 5000, // 5 giây
                timeout: 10000 // 10 giây
            });

            const newAppointmentEntity = new ServiceAppointment(
                newAppointment.id, customerId, vehicleId, serviceCenterId,
                newAppointment.appointmentDate, newAppointment.status,
                newAppointment.customerNotes, newAppointment.createdAt
            );

            return newAppointmentEntity;

        } catch (error) {
            console.error("Error creating appointment:", error.message);
            if (error.message.includes("slot is no longer available") ||
                error.message.includes("service types are invalid") ||
                error instanceof Prisma.PrismaClientKnownRequestError) {
                 throw new Error(error.message);
            }
             throw new Error("Failed to create appointment.");
        }
    }
}

module.exports = CreateAppointmentUseCase;