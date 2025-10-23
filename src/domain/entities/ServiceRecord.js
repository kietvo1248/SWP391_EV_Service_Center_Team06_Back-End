class ServiceRecord {
    constructor(id, appointmentId, technicianId, status, startTime, endTime, staffNotes) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.technicianId = technicianId;
        this.status = status; // Ví dụ: PENDING, IN_PROGRESS, COMPLETED
        this.startTime = startTime;
        this.endTime = endTime;
        this.staffNotes = staffNotes;

    }
}

module.exports = ServiceRecord;