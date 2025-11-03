class IQuotationRepository {
    async create(data, tx) {
        throw new Error("Method 'create()' must be implemented.");
    }
    async findByServiceRecordId(serviceRecordId) {
        throw new Error("Method 'findByServiceRecordId()' must be implemented.");
    }
    async findById(id) {
        throw new Error("Method 'findById()' must be implemented.");
    }
    async update(id, data, tx) {
        throw new Error("Method 'update()' must be implemented.");
    }
}
module.exports = IQuotationRepository;  