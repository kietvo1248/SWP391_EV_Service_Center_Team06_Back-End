const { Role } = require('@prisma/client');

class UpdateInventoryConfig {
    // (SỬA) Thêm restockRequestRepo vào constructor
    constructor(inventoryItemRepo, restockRequestRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
        this.restockRequestRepo = restockRequestRepo;
    }

    async execute(actor, itemId, { minStockLevel }) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }

        // 1. Tìm món hàng
        const item = await this.inventoryItemRepo.findById(itemId);
        if (!item || item.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Item not found in your center.");
        }

        // 2. (THÊM MỚI) Kiểm tra xem có yêu cầu nhập hàng nào đang treo không
        const activeRequest = await this.restockRequestRepo.findActiveByPartAndCenter(
            item.partId, 
            actor.serviceCenterId
        );

        if (activeRequest) {
            throw new Error(`Cannot update item. There is a pending/approved restock request (ID: ${activeRequest.id}) for this part. Please complete or reject it first.`);
        }

        // 3. Nếu không có yêu cầu treo, cho phép update
        return this.inventoryItemRepo.update(itemId, {
            minStockLevel: parseInt(minStockLevel)
        });
    }
}
module.exports = UpdateInventoryConfig;