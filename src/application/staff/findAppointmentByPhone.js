class FindAppointmentsByPhone {
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    async execute(serviceCenterId, phone) {
        if (!phone) {
            throw new Error('Phone number is required.');
        }
        return this.appointmentRepo.findConfirmedByCustomerPhone(serviceCenterId, phone);
    }
}
module.exports = FindAppointmentsByPhone;