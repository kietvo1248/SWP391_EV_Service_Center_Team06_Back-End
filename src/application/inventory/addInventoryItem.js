const { Role } = require('@prisma/client');

class AddInventoryItem {
    constructor(inventoryItemRepo, partRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
        this.partRepo = partRepo;
    }

    async execute(actor, { partId, minStockLevel }) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }

        // 1. Kiểm tra Part có tồn tại trong hệ thống không
        const part = await this.partRepo.findById(partId);
        if (!part) throw new Error("Part definition not found.");

        // 2. Kiểm tra xem trong kho đã có món này chưa
        const existingItem = await this.inventoryItemRepo.findByPartAndCenter(partId, actor.serviceCenterId);
        if (existingItem) {
            throw new Error("This part already exists in your inventory.");
        }

        // 3. Tạo mới (Quantity mặc định là 0)
        return this.inventoryItemRepo.create({
            partId: partId,
            serviceCenterId: actor.serviceCenterId,
            minStockLevel: minStockLevel || 5,
            quantityInStock: 0,
            isDeleted: false
        });
    }
}
module.exports = AddInventoryItem;