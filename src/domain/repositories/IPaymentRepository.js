class IPaymentRepository {
    async create(data, tx) {
        throw new Error("Method 'create()' must be implemented.");
    }
}
module.exports = IPaymentRepository;