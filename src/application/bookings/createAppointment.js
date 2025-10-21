// Tệp: src/application/bookings/createAppointment.js

const ServiceAppointment = require('../../domain/entities/ServiceAppointment');

class CreateAppointmentUseCase {
    constructor(appointmentRepository, vehicleRepository) {
        this.appointmentRepository = appointmentRepository;
        this.vehicleRepository = vehicleRepository;
    }

    async execute(appointmentData, customerId) {
        // Lấy các dịch vụ yêu cầu từ appointmentData
        const { 
            vehicleId, 
            appointmentDate, 
            serviceCenterId, 
            customerNotes, 
            requestedServices // Đây là mảng các serviceType ID (ví dụ: ['uuid1', 'uuid2'])
        } = appointmentData;

        // 1. Validation: Kiểm tra xe có thuộc sở hữu của khách hàng không
        const vehicle = await this.vehicleRepository.findByIdAndOwner(vehicleId, customerId);
        if (!vehicle) {
            throw new Error("Vehicle not found or you are not the owner.");
        }

        // 2. Validation: Ngày hẹn phải ở trong tương lai
        if (new Date(appointmentDate) <= new Date()) {
            throw new Error("Appointment date must be in the future.");
        }
        
        // 3. TODO: Validation kiểm tra slot trống tại trung tâm (logic này cần được thêm sau)

        // 4. Tạo một instance của Domain Entity
        const newAppointmentEntity = new ServiceAppointment(
            null, // id
            customerId,
            vehicleId,
            serviceCenterId,
            new Date(appointmentDate),
            'PENDING', // Trạng thái mặc định
            customerNotes,
            null // createdAt
        );

        // 5. Gửi Domain Entity và mảng requestedServices cho Repository
        return this.appointmentRepository.add(newAppointmentEntity, requestedServices);
    }
}

module.exports = CreateAppointmentUseCase;