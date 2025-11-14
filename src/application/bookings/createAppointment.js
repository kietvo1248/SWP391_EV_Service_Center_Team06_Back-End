// Tệp: src/application/bookings/createAppointment.js
const ServiceAppointment = require('../../domain/entities/ServiceAppointment');
const { Prisma, AppointmentStatus } = require('@prisma/client'); 

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
            // (SỬA) Đổi tên biến để rõ ràng hơn
            servicePackageId // Thay vì requestedServices (mảng)
        } = appointmentData;

        // (SỬA) Kiểm tra servicePackageId
        if (!servicePackageId) {
            throw new Error("A service package (servicePackageId) must be selected.");
        }

        // ... (Logic kiểm tra vehicle, appointmentDate, center, capacity vẫn giữ nguyên) ...
        const vehicle = await this.vehicleRepository.findById(vehicleId, customerId);
        if (!vehicle) {
            throw new Error("Vehicle not found or you are not the owner.");
        }
        const appointmentDateTime = new Date(appointmentDate);
        if (isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
            throw new Error("Appointment date must be a valid date in the future.");
        }

        try {
            const center = await this.serviceCenterRepository.getServiceCenterById(serviceCenterId);
            if (!center) {
                throw new Error("Service center not found.");
            }
            const capacity = center.capacityPerSlot;

            const newAppointment = await this.prisma.$transaction(async (tx) => {
                // ... (Logic kiểm tra existingCount vẫn giữ nguyên) ...
                const existingCount = await tx.serviceAppointment.count({
                    where: {
                        serviceCenterId: serviceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: {
                            in: [
                                AppointmentStatus.PENDING,
                                AppointmentStatus.CONFIRMED,
                                AppointmentStatus.IN_PROGRESS,
                                // (XÓA) PENDING_APPROVAL
                            ]
                        }
                    }
                });
                if (existingCount >= capacity) {
                    throw new Error("This time slot is no longer available.");
                }

                // Tạo lịch hẹn (vẫn giữ nguyên)
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

                 // (SỬA) Liên kết chỉ 1 service package
                const validServiceType = await tx.serviceType.findUnique({
                    where: { id: servicePackageId },
                    select: { id: true }
                });
                if (!validServiceType) {
                    throw new Error("The selected service package is invalid.");
                }
                
                await tx.appointmentService.create({
                    data: {
                        appointmentId: createdAppt.id,
                        serviceTypeId: servicePackageId,
                    }
                });
                
                return createdAppt; 
            }, {
                isolationLevel: 'Serializable',
                maxWait: 5000, 
                timeout: 10000 
            });

            // ... (Logic trả về Entity vẫn giữ nguyên) ...
            const newAppointmentEntity = new ServiceAppointment(
                newAppointment.id, customerId, vehicleId, serviceCenterId,
                newAppointment.appointmentDate, newAppointment.status,
                newAppointment.customerNotes, newAppointment.createdAt
            );
            return newAppointmentEntity;

        } catch (error) {
            console.error("Error creating appointment:", error.message);
            if (error.message.includes("slot") ||
                error.message.includes("service package") || // (SỬA)
                error instanceof Prisma.PrismaClientKnownRequestError) {
                 throw new Error(error.message);
            }
             throw new Error("Failed to create appointment.");
        }
    }
}

module.exports = CreateAppointmentUseCase;