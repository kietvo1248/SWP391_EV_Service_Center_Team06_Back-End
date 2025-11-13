// Tệp: src/application/technician/acceptTask.js
const { ServiceRecordStatus } = require('@prisma/client');
const ServiceRecordEntity = require('../../domain/entities/ServiceRecord');

class AcceptTask {
    constructor(serviceRecordRepository) {
        this.serviceRecordRepo = serviceRecordRepository;
    }

    async execute(serviceRecordId, technicianId) {
        // 1. Kiểm tra Service Record
        const record = await this.serviceRecordRepo.findById(serviceRecordId);
        if (!record) {
            throw new Error('Service record not found.');
        }
        
        // 2. Kiểm tra quyền sở hữu (đúng KTV được gán)
        if (record.technicianId !== technicianId) {
            throw new Error('Forbidden. You are not assigned to this task.');
        }
        
        // 3. Kiểm tra trạng thái (Chỉ chấp nhận việc PENDING)
        if (record.status !== ServiceRecordStatus.PENDING) {
            throw new Error(`Cannot accept task. Task status is ${record.status}, not PENDING.`);
        }

        // 4. Cập nhật trạng thái sang IN_PROGRESS
        const updatedRecordPrisma = await this.serviceRecordRepo.update(serviceRecordId, {
            status: ServiceRecordStatus.IN_PROGRESS
        });

        // 5. Trả về Entity (để controller có thể response)
        return new ServiceRecordEntity(
            updatedRecordPrisma.id,
            updatedRecordPrisma.appointmentId,
            updatedRecordPrisma.technicianId,
            updatedRecordPrisma.status,
            updatedRecordPrisma.startTime,
            updatedRecordPrisma.endTime,
            updatedRecordPrisma.staffNotes
        );
    }
}
module.exports = AcceptTask;