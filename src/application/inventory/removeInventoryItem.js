const { Role } = require('@prisma/client');

class RemoveInventoryItem {
    constructor(inventoryItemRepo, restockRequestRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
        this.restockRequestRepo = restockRequestRepo;
    }

    async execute(actor, itemId) {

        const item = await this.inventoryItemRepo.findById(itemId);
        if (!item || item.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Item not found.");
        }

        if (item.quantityInStock > 0) {
            throw new Error("Cannot delete item while stock is greater than 0.");
        }

        const activeRequest = await this.restockRequestRepo.findActiveByPartAndCenter(
                item.partId, 
                actor.serviceCenterId
            );

            if (activeRequest) {
                throw new Error(`Không thể xóa. Mặt hàng này đang có Yêu cầu Nhập hàng (ID: ${activeRequest.id}) ở trạng thái ${activeRequest.status}.`);
            }

        return this.inventoryItemRepo.softDelete(itemId);
    }
}
module.exports = RemoveInventoryItem;