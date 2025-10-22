// Tệp: src/application/staff/assignAndConfirmAppointment.js
class AssignAndConfirmAppointment {
    constructor(appointmentRepository, serviceRecordRepository, userRepository, prismaClient) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRecordRepository = serviceRecordRepository;
        this.userRepository = userRepository;
        this.prisma = prismaClient; // Cần prisma client để điều khiển transaction
    }

    async execute(appointmentId, technicianId, staffServiceCenterId) {
        // --- 1. Xác thực dữ liệu ---
        const appointment = await this.appointmentRepository.findById(appointmentId);
        if (!appointment) {
            throw new Error('Appointment not found.');
        }
        if (appointment.serviceCenterId !== staffServiceCenterId) {
            throw new Error('Forbidden. Appointment is not in your center.');
        }
        if (appointment.status !== 'PENDING') {
            throw new Error('Appointment has already been processed.');
        }

        const technician = await this.userRepository.findById(technicianId);
        if (!technician || technician.role !== 'TECHNICIAN' || technician.serviceCenterId !== staffServiceCenterId) {
            throw new Error('Invalid technician or technician does not belong to this center.');
        }

        // --- 2. Thực thi Transaction ---
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // Bước 2a: Cập nhật trạng thái Lịch hẹn
                const updatedAppointment = await this.appointmentRepository.updateStatus(
                    appointmentId, 
                    'CONFIRMED', // Chuyển trạng thái
                    tx // Truyền transaction client
                );

                // Bước 2b: Tạo Hồ sơ Dịch vụ (Service Record)
                const newServiceRecord = await this.serviceRecordRepository.create({
                    appointmentId: appointmentId,
                    technicianId: technicianId,
                    status: 'PENDING',
                    startTime: new Date(), // (Tùy chọn) Ghi nhận thời gian bắt đầu
                }, tx); // Truyền transaction client

                return { updatedAppointment, newServiceRecord };
            });

            return result;

        } catch (error) {
            console.error('Transaction failed:', error);
            throw new Error('Failed to confirm appointment. Please try again.');
        }
    }
}
module.exports = AssignAndConfirmAppointment;