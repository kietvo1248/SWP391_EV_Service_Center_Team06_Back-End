// Tệp: src/domain/repositories/IPartUsageRepository.js
class IPartUsageRepository {
    
    /**
     * Tạo một bản ghi sử dụng phụ tùng mới
     * (Dùng trong submitDiagnosis)
     * @param {object} data - Dữ liệu PartUsage
     * @param {object} tx - (Tùy chọn) Prisma Transaction Client
     * @returns {Promise<PartUsage>}
     */
    async create(data, tx) {
        throw new Error('Method not implemented');
    }

    /**
     * Tìm các phụ tùng đã yêu cầu theo Service Record
     * (Dùng trong respondToQuotation và issuePartForService)
     * @param {string} serviceRecordId
     * @param {PartUsageStatus} status - (Tùy chọn) Lọc theo trạng thái
     * @returns {Promise<PartUsage[]>}
     */
    async findByServiceRecord(serviceRecordId, status = null) {
        throw new Error('Method not implemented');
    }

    /**
     * Cập nhật hàng loạt trạng thái của PartUsage theo Service Record
     * (Dùng trong respondToQuotation khi khách từ chối)
     * @param {string} serviceRecordId
     * @param {PartUsageStatus} newStatus - Trạng thái mới (vd: CANCELLED)
     * @param {PartUsageStatus} oldStatus - (Tùy chọn) Chỉ cập nhật nếu trạng thái cũ là
     * @param {object} tx - (Tùy chọn) Prisma Transaction Client
     * @returns {Promise<{ count: number }>}
     */
    async updateStatusByRecordId(serviceRecordId, newStatus, oldStatus = null, tx) {
        throw new Error('Method not implemented');
    }
}
module.exports = IPartUsageRepository;