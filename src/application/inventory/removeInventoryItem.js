const { Role } = require('@prisma/client');

class RemoveInventoryItem {
    constructor(inventoryItemRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
    }

    async execute(actor, itemId) {
        if (![Role.STATION_ADMIN].includes(actor.role)) { // Chỉ Station Admin mới được xóa
            throw new Error("Forbidden: Only Station Admin can delete items.");
        }

        const item = await this.inventoryItemRepo.findById(itemId);
        if (!item || item.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Item not found.");
        }

        if (item.quantityInStock > 0) {
            throw new Error("Cannot delete item while stock is greater than 0.");
        }

        return this.inventoryItemRepo.softDelete(itemId);
    }
}
module.exports = RemoveInventoryItem;