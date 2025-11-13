// Tệp: src/application/bookings/appointmentHistory.js
const { AppointmentStatus } = require('@prisma/client');

class ListAppointmentHistory {
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }

    async execute(customerId) {
        // Lấy các lịch hẹn đã kết thúc (Hoàn thành, Hủy)
        const statuses = [
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.PENDING_APPROVAL,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED,
        ];
        
        // Repo (đã sửa) sẽ trả về cấu trúc mới
        const history = await this.appointmentRepo.findByCustomerId(customerId, statuses);
        
        // Định dạng lại dữ liệu trả về cho gọn
        return history.map(appt => {
            
            // Truy cập vào vehicleModel lồng bên trong
            const vehicleInfo = (appt.vehicle && appt.vehicle.vehicleModel)
                ? `${appt.vehicle.vehicleModel.brand} ${appt.vehicle.vehicleModel.name} (${appt.vehicle.licensePlate || 'N/A'})`
                : 'N/A';

            return {
                id: appt.id,
                appointmentDate: appt.appointmentDate,
                status: appt.status,
                vehicle: vehicleInfo, // Sử dụng chuỗi đã định dạng
                serviceCenter: appt.serviceCenter?.name || 'N/A',
                serviceTitle: appt.requestedServices[0]?.serviceType?.name || 'Dịch vụ'
            };
        });
    }
}
module.exports = ListAppointmentHistory;