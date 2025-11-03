// Tệp: src/domain/repositories/IInventoryItemRepository.js
class IInventoryItemRepository {
    async findByCenter(serviceCenterId) {
        throw new Error("Method 'findByCenter()' must be implemented.");
    }
    async findById(id) {
        throw new Error("Method 'findById()' must be implemented.");
    }
    async findByPartAndCenter(partId, serviceCenterId) {
        throw new Error("Method 'findByPartAndCenter()' must be implemented.");
    }
    async update(id, data, tx) {
        throw new Error("Method 'update()' must be implemented.");
    }
}
module.exports = IInventoryItemRepository;