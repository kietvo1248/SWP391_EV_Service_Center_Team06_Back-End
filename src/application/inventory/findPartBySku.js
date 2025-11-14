// Tệp: src/application/inventory/findPartBySku.js
const { Role } = require('@prisma/client');

class FindPartBySku {
    constructor(inventoryItemRepository) {
        this.inventoryItemRepo = inventoryItemRepository;
    }
    
    async execute(sku, actor) {
        // Cho phép KTV, IM, và SA tìm kiếm
        if (![Role.TECHNICIAN, Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
             throw new Error("Forbidden: Access denied.");
        }
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }
        if (!sku) {
            throw new Error("SKU is required for search.");
        }

        // Gọi phương thức repo mới
        const item = await this.inventoryItemRepo.findBySku(sku, actor.serviceCenterId);
        
        if (!item) {
            throw new Error(`Part with SKU '${sku}' not found in your center's inventory.`);
        }
        
        return item;
    }
}
module.exports = FindPartBySku;