// Tệp: src/domain/repositories/IInvoiceRepository.js
class IInvoiceRepository {
    async create(data, tx) {
        throw new Error("Method 'create()' must be implemented.");
    }
    async updateStatus(id, status, tx) {
        throw new Error("Method 'updateStatus()' must be implemented.");
    }
    async findByServiceRecordId(serviceRecordId) {
        throw new Error("Method 'findByServiceRecordId()' must be implemented.");
    }
}
module.exports = IInvoiceRepository;