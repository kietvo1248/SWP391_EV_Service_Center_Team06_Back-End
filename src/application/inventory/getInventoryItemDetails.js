// Tệp: src/application/inventory/getInventoryItemDetails.js
const { Role } = require('@prisma/client');

class GetInventoryItemDetails {
    constructor(inventoryItemRepository) {
        this.inventoryItemRepo = inventoryItemRepository;
    }

    async execute(actor, itemId) {
        // 1. Kiểm tra quyền (KTV, IM, SA đều được xem)
        const allowedRoles = [Role.TECHNICIAN, Role.INVENTORY_MANAGER, Role.STATION_ADMIN];
        if (!allowedRoles.includes(actor.role)) {
            throw new Error("Forbidden.");
        }
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }

        // 2. Lấy item
        const item = await this.inventoryItemRepo.findById(itemId);

        // 3. Kiểm tra xem item có tồn tại và có thuộc trạm của actor không
        if (!item || item.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Inventory item not found in your center.");
        }

        return item; // Trả về item (đã bao gồm "part" bên trong)
    }
}
module.exports = GetInventoryItemDetails;