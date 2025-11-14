const { Role } = require('@prisma/client');

class ListLowStockItems {
    constructor(inventoryItemRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
    }

    async execute(actor) {
        if (!actor.serviceCenterId) throw new Error("No center assigned.");
        
        // Trả về danh sách các item có quantity <= minStockLevel
        return this.inventoryItemRepo.findLowStock(actor.serviceCenterId);
    }
}
module.exports = ListLowStockItems;