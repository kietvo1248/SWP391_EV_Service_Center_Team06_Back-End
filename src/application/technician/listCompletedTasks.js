// Tệp: src/application/technician/listCompletedTasks.js
const { ServiceRecordStatus } = require('@prisma/client');

class ListCompletedTasks {
    constructor(serviceRecordRepository) {
        this.serviceRecordRepo = serviceRecordRepository;
    }

    async execute(technicianId) {
        // Gọi repo và chỉ lấy trạng thái COMPLETED
        return this.serviceRecordRepo.findByTechnician(technicianId, [ServiceRecordStatus.COMPLETED]);
    }
}
module.exports = ListCompletedTasks;