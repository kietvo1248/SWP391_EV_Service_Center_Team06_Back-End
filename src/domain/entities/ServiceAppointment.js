class ServiceAppointment {
    constructor(id, customerId, vehicleId, serviceCenterId, appointmentDate, status, customerNotes, createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.vehicleId = vehicleId;
        this.serviceCenterId = serviceCenterId;
        this.appointmentDate = appointmentDate;
        this.status = status; // Ví dụ: PENDING, CONFIRMED, COMPLETED
        this.customerNotes = customerNotes;
        this.createdAt = createdAt;
    }
}

module.exports = ServiceAppointment;
