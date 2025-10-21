const ServiceAppointment = require('../../domain/entities/ServiceAppointment');

class CreateAppointmentUseCase {
    constructor(appointmentRepository, vehicleRepository) {
        this.appointmentRepository = appointmentRepository;
        this.vehicleRepository = vehicleRepository;
    }

    async execute(appointmentData, customerId) {
        const { vehicleId, appointmentDate, serviceCenterId, customerNotes } = appointmentData;

        // 1. Validation: Kiểm tra xe có thuộc sở hữu của khách hàng không
        const vehicle = await this.vehicleRepository.findByIdAndOwner(vehicleId, customerId);
        if (!vehicle) {
            throw new Error("Vehicle not found or you are not the owner.");
        }

        // 2. Validation: Ngày hẹn phải ở trong tương lai
        if (new Date(appointmentDate) <= new Date()) {
            throw new Error("Appointment date must be in the future.");
        }
        
        // 3. TODO: Validation kiểm tra slot trống tại trung tâm

        // 4. Tạo một instance của Domain Entity
        const newAppointmentEntity = new ServiceAppointment(
            null, // id sẽ được CSDL tự tạo
            customerId,
            vehicleId,
            serviceCenterId,
            new Date(appointmentDate),
            'PENDING', // Trạng thái mặc định
            customerNotes,
            null // createdAt sẽ được CSDL tự tạo
        );

        // 5. Gửi Domain Entity này cho Repository để lưu trữ
        return this.appointmentRepository.add(newAppointmentEntity);
    }
}

module.exports = CreateAppointmentUseCase;