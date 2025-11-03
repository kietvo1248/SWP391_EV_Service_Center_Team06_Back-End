// Tệp: src/application/inventory/updateStockQuantity.js
const { Role } = require('@prisma/client');
class UpdateStockQuantity {
    constructor(inventoryItemRepository) {
        this.inventoryItemRepo = inventoryItemRepository;
    }
    async execute(inventoryItemId, newQuantity, actor) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden: Access denied.");
        }
        const item = await this.inventoryItemRepo.findById(inventoryItemId);
        if (!item || item.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Inventory item not found or not in your center.");
        }
        if (newQuantity < 0 || !Number.isInteger(newQuantity)) {
            throw new Error("Invalid quantity.");
        }
        return this.inventoryItemRepo.update(inventoryItemId, { quantityInStock: newQuantity });
    }
}
module.exports = UpdateStockQuantity;