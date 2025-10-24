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
}

module.exports = IServiceRecordRepository;