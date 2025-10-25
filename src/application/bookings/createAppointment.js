// Tệp: src/application/bookings/createAppointment.js
const ServiceAppointment = require('../../domain/entities/ServiceAppointment');
// Thêm PrismaClient và Enums nếu cần kiểm tra status
const { PrismaClient, AppointmentStatus } = require('@prisma/client');

class CreateAppointmentUseCase {
    // Inject thêm prisma client và serviceCenterRepository
    constructor(appointmentRepository, vehicleRepository, serviceCenterRepository, prismaClient) {
        this.appointmentRepository = appointmentRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceCenterRepository = serviceCenterRepository; // Để lấy capacity
        this.prisma = prismaClient; // Để kiểm tra count trong transaction
    }

    async execute(appointmentData, customerId) {
        const {
            vehicleId,
            appointmentDate,
            serviceCenterId,
            customerNotes,
            requestedServices
        } = appointmentData;

        // --- VALIDATIONS (Giữ nguyên) ---
        const vehicle = await this.vehicleRepository.findByIdAndOwner(vehicleId, customerId);
        if (!vehicle) {
            throw new Error("Vehicle not found or you are not the owner.");
        }
        const appointmentDateTime = new Date(appointmentDate); // Chuyển thành Date object
        if (isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
            throw new Error("Appointment date must be a valid date in the future.");
        }

        // --- KIỂM TRA SLOT TRONG TRANSACTION ---
        try {
            // Lấy thông tin capacity của center (có thể cache nếu cần tối ưu)
            const center = await this.serviceCenterRepository.getServiceCenterById(serviceCenterId);
            if (!center) {
                throw new Error("Service center not found.");
            }
            const capacity = center.capacityPerSlot;

            // Tạo appointment bên trong transaction để kiểm tra slot
            const newAppointment = await this.prisma.$transaction(async (tx) => {
                // Đếm số lịch hẹn hiện có CÙNG THỜI GIAN, CÙNG TRUNG TÂM với trạng thái hợp lệ
                const existingCount = await tx.serviceAppointment.count({
                    where: {
                        serviceCenterId: serviceCenterId,
                        appointmentDate: appointmentDateTime, // So sánh chính xác thời gian
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

                // Nếu còn slot -> Tạo lịch hẹn (logic từ repo.add chuyển vào đây)
                 const createdAppt = await tx.serviceAppointment.create({
                    data: {
                        customerId: customerId,
                        vehicleId: vehicleId,
                        serviceCenterId: serviceCenterId,
                        appointmentDate: appointmentDateTime,
                        status: AppointmentStatus.PENDING, // Mặc định PENDING
                        customerNotes: customerNotes,
                    },
                });

                 // Liên kết services nếu có
                if (requestedServices && requestedServices.length > 0) {
                    const servicesToLink = requestedServices.map(serviceTypeId => ({
                        appointmentId: createdAppt.id,
                        serviceTypeId: serviceTypeId,
                    }));
                    // Kiểm tra serviceTypeId tồn tại trước khi tạo (quan trọng!)
                    const validServiceTypes = await tx.serviceType.findMany({
                        where: { id: { in: requestedServices } },
                        select: { id: true }
                    });
                    if (validServiceTypes.length !== requestedServices.length) {
                        throw new Error("One or more requested service types are invalid.");
                    }
                    await tx.appointmentService.createMany({
                        data: servicesToLink,
                    });
                }
                return createdAppt; // Trả về lịch hẹn đã tạo trong transaction
            });

            // Chuyển đổi sang Entity trước khi trả về (nếu cần)
            const newAppointmentEntity = new ServiceAppointment(
                newAppointment.id, customerId, vehicleId, serviceCenterId,
                newAppointment.appointmentDate, newAppointment.status,
                newAppointment.customerNotes, newAppointment.createdAt
            );

            return newAppointmentEntity;

        } catch (error) {
            // Log lỗi để debug phía server
            console.error("Error creating appointment:", error.message);
            // Ném lại lỗi để controller xử lý
            if (error.message.includes("slot is no longer available") ||
                error.message.includes("service types are invalid") ||
                error instanceof Prisma.PrismaClientKnownRequestError) { // Bắt các lỗi Prisma khác
                 throw new Error(error.message); // Giữ nguyên thông báo lỗi nghiệp vụ/DB
            }
             throw new Error("Failed to create appointment."); // Lỗi chung
        }
    }
}

module.exports = CreateAppointmentUseCase;