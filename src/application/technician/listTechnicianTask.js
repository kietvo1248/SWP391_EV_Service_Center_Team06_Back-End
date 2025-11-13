// Tệp: src/application/technician/listTechnicianTasks.js
const { ServiceRecordStatus } = require('@prisma/client'); // (THÊM)

class ListTechnicianTasks {
    constructor(serviceRecordRepo) {
        this.serviceRecordRepo = serviceRecordRepo;
    }

    async execute(technicianId, status) {
        // (SỬA) Nếu không lọc, mặc định chỉ lấy PENDING và IN_PROGRESS
        const taskStatuses = status 
            ? (Array.isArray(status) ? status : [status]) 
            : [ServiceRecordStatus.CONFIRMED, ServiceRecordStatus.IN_PROGRESS];
            
        // (SỬA) Repo cần hỗ trợ lọc theo mảng trạng thái
        // Chúng ta sẽ giả định repo findByTechnician(id, statusArray) hỗ trợ mảng
        return this.serviceRecordRepo.findByTechnician(technicianId, taskStatuses);
    }
}
module.exports = ListTechnicianTasks;