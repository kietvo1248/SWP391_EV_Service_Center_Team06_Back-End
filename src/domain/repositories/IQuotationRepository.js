class IQuotationRepository {
    async create(data, tx) {
        throw new Error("Method 'create()' must be implemented.");
    }
    async findByServiceRecordId(serviceRecordId) {
        throw new Error("Method 'findByServiceRecordId()' must be implemented.");
    }
}
module.exports = IQuotationRepository;  