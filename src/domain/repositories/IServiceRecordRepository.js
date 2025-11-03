// Tệp: src/domain/repositories/IServiceRecordRepository.js
class IServiceRecordRepository {
    /**
     * Tạo một hồ sơ dịch vụ (ServiceRecord) mới
     * @param {object} data (chứa appointmentId, technicianId, status)
     * @param {object} tx - Prisma Transaction Client (tùy chọn)
     */
    async create(data, tx) {
        throw new Error("Method 'create()' must be implemented.");
    }
    async findByTechnician(technicianId, status) {
        throw new Error("Method 'findByTechnician()' must be implemented.");
    }

    async findById(recordId) {
        throw new Error("Method 'findById()' must be implemented.");
    }

    async findByAppointmentId(appointmentId) {
         throw new Error("Method 'findByAppointmentId()' must be implemented.");
    }

    async update(recordId, data, tx) {
        throw new Error("Method 'update()' must be implemented.");
    }
    async findByCenterAndStatus(serviceCenterId, status) {
        throw new Error("Method 'findByCenterAndStatus()' must be implemented.");
    }
}

module.exports = IServiceRecordRepository;