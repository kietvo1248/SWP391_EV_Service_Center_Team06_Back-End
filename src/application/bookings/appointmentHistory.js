const { AppointmentStatus } = require('@prisma/client');

class ListAppointmentHistory {
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }

    async execute(customerId) {
        // Lấy các lịch hẹn đã kết thúc (Hoàn thành, Hủy)
        const statuses = [
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED,
        ];
        
        const history = await this.appointmentRepo.findByCustomerId(customerId, statuses);
        
        // Định dạng lại dữ liệu trả về cho gọn
        return history.map(appt => ({
            id: appt.id,
            appointmentDate: appt.appointmentDate,
            status: appt.status,
            vehicle: appt.vehicle ? `${appt.vehicle.make} ${appt.vehicle.model} (${appt.vehicle.licensePlate || 'N/A'})` : 'N/A',
            serviceCenter: appt.serviceCenter?.name || 'N/A',
            serviceTitle: appt.requestedServices[0]?.serviceType?.name || 'Dịch vụ'
        }));
    }
}
module.exports = ListAppointmentHistory;