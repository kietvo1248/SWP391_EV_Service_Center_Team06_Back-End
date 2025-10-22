class GetAppointmentDetails {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(appointmentId, staffServiceCenterId) {
        const appointment = await this.appointmentRepository.findById(appointmentId);

        if (!appointment) {
            throw new Error('Appointment not found.');
        }
        // Bảo mật: Đảm bảo nhân viên chỉ xem lịch hẹn tại trung tâm của họ
        if (appointment.serviceCenterId !== staffServiceCenterId) {
            throw new Error('Forbidden. You do not have access to this appointment.');
        }

        return appointment;
    }
}
module.exports = GetAppointmentDetails;