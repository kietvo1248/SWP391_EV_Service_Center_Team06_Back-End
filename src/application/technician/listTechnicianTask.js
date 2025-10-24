// Tệp: src/application/technician/listTechnicianTasks.js
class ListTechnicianTasks {
    constructor(serviceRecordRepo) {
        this.serviceRecordRepo = serviceRecordRepo;
    }
    async execute(technicianId, status) {
        // Mặc định lấy các việc "IN_PROGRESS"
        const taskStatus = status || 'IN_PROGRESS';
        return this.serviceRecordRepo.findByTechnician(technicianId, taskStatus);
    }
}
module.exports = ListTechnicianTasks;