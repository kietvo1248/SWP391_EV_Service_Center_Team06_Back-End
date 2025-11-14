// Tệp: src/application/bookings/cancelAppointmentByCustomer.js
const { AppointmentStatus, ServiceRecordStatus } = require('@prisma/client');

class CancelAppointmentByCustomer {
    constructor(appointmentRepository, serviceRecordRepository, prismaClient) {
        this.appointmentRepo = appointmentRepository;
        this.serviceRecordRepo = serviceRecordRepository;
        this.prisma = prismaClient;
    }

    async execute(appointmentId, actorId) {
        // 1. Lấy lịch hẹn (sử dụng findById đơn giản, vì ta cần serviceRecord)
        const appointment = await this.appointmentRepo.findById(appointmentId);

        // 2. Xác thực
        if (!appointment) {
            throw new Error('Lịch hẹn không tìm thấy.');
        }
        if (appointment.customerId !== actorId) {
            throw new Error('Bạn không có quyền hủy lịch hẹn này.');
        }

        // 3. Kiểm tra logic nghiệp vụ: Khách hàng chỉ được hủy khi lịch hẹn
        // đang ở trạng thái PENDING hoặc CONFIRMED
        if (![AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status)) {
            throw new Error(`Không thể hủy lịch hẹn đang ở trạng thái ${appointment.status}. Vui lòng liên hệ trung tâm.`);
        }

        // 4. Bắt đầu Transaction
        return this.prisma.$transaction(async (tx) => {
            // Cập nhật Lịch hẹn
            const updatedAppt = await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.CANCELLED, tx);
            
            // Nếu đã có ServiceRecord (tức là đã CONFIRMED), hủy nó luôn
            if (appointment.serviceRecord) {
                await this.serviceRecordRepo.update(appointment.serviceRecord.id, { status: ServiceRecordStatus.CANCELLED }, tx);
            }

            return updatedAppt; // Trả về lịch hẹn đã hủy
        });
    }
}
module.exports = CancelAppointmentByCustomer;