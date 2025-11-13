// Tệp: src/domain/entities/ServiceAppointment.js
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
        
        this.customer = null; // Để gán UserEntity
        this.vehicle = null;
        this.serviceCenterName = null; // Tên trung tâm dịch vụ
        this.requestedServices = [];
        
        this.serviceRecord = null; // (THÊM DÒNG NÀY VÀO)
    }
}

module.exports = ServiceAppointment;