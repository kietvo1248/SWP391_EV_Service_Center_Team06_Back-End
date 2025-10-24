class ListCenterAppointments {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(serviceCenterId, status) {
        if (!serviceCenterId) {
            throw new Error('Service center ID is required.');
        }
        return this.appointmentRepository.findByCenterId(serviceCenterId, status);
    }
}
module.exports = ListCenterAppointments;