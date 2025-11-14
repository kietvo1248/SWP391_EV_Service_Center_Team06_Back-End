// Tệp: src/application/staff/cancelAppointmentByStaff.js
const { AppointmentStatus, ServiceRecordStatus, Role } = require('@prisma/client');

class CancelAppointmentByStaff {
    constructor(appointmentRepository, serviceRecordRepository, prismaClient) {
        this.appointmentRepo = appointmentRepository;
        this.serviceRecordRepo = serviceRecordRepository;
        this.prisma = prismaClient;
    }

    async execute(appointmentId, actor) {
        // 1. Lấy lịch hẹn
        const appointment = await this.appointmentRepo.findById(appointmentId);

        // 2. Xác thực
        if (!appointment) {
            throw new Error('Lịch hẹn không tìm thấy.');
        }
        if (appointment.serviceCenterId !== actor.serviceCenterId && actor.role !== Role.ADMIN) {
            throw new Error('Bạn không có quyền hủy lịch hẹn tại trạm này.');
        }

        // 3. Kiểm tra logic nghiệp vụ: Nhân viên có thể hủy PENDING, CONFIRMED, hoặc IN_PROGRESS
        const allowedStatuses = [
            AppointmentStatus.PENDING, 
            AppointmentStatus.CONFIRMED, 
            AppointmentStatus.IN_PROGRESS
        ];

        if (!allowedStatuses.includes(appointment.status)) {
            throw new Error(`Không thể hủy lịch hẹn đã ${appointment.status}.`);
        }

        // 4. Bắt đầu Transaction
        return this.prisma.$transaction(async (tx) => {
            // Cập nhật Lịch hẹn
            const updatedAppt = await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.CANCELLED, tx);
            
            // Nếu đã có ServiceRecord, hủy nó luôn
            if (appointment.serviceRecord) {
                await this.serviceRecordRepo.update(appointment.serviceRecord.id, { status: ServiceRecordStatus.CANCELLED }, tx);
                
                // LƯU Ý: Logic này CHƯA hoàn trả phụ tùng (PartUsage) đã ISSUED
                // về kho nếu hủy khi đang IN_PROGRESS. Đây là một nghiệp vụ "Hoàn kho" (Restocking)
                // phức tạp hơn, tạm thời chúng ta chấp nhận việc này.
            }

            return updatedAppt; // Trả về lịch hẹn đã hủy
        });
    }
}
module.exports = CancelAppointmentByStaff;