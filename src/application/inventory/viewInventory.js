// Tệp: src/application/inventory/viewInventory.js
const { Role } = require('@prisma/client');
class ViewInventory {
    constructor(inventoryItemRepository) {
        this.inventoryItemRepo = inventoryItemRepository;
    }
    async execute(actor) {
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }
        
        // (SỬA) Thêm Role.TECHNICIAN vào danh sách được phép
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN, Role.TECHNICIAN].includes(actor.role)) {
            throw new Error("Forbidden: Access denied.");
        }
        
        return this.inventoryItemRepo.findByCenter(actor.serviceCenterId);
    }
}
module.exports = ViewInventory;