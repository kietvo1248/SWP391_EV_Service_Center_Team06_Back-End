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
    /**
     * (THÊM MỚI) Tìm một phụ tùng trong kho bằng SKU tại một trung tâm
     * @param {string} sku - Mã SKU của phụ tùng
     * @param {string} serviceCenterId - ID của trung tâm
     */
    async findBySku(sku, serviceCenterId) {
        throw new Error("Method 'findBySku()' must be implemented.");
    }
}
module.exports = IInventoryItemRepository;