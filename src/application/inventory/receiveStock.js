// Tệp: src/application/inventory/receiveStock.js
// luồng 3.3 Inventory Manager hoặc Station Admin nhập hàng về kho
// Tệp: src/application/inventory/receiveStock.js
const { RestockRequestStatus, Role } = require('@prisma/client');
class ReceiveStock {
    constructor(inventoryItemRepository, restockRequestRepository, prismaClient) {
        this.inventoryItemRepo = inventoryItemRepository;
        this.restockRequestRepo = restockRequestRepository;
        this.prisma = prismaClient; // Cần cho transaction
    }
    async execute(requestId, quantityReceived, actor) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }
        if (quantityReceived <= 0) throw new Error("Quantity received must be positive.");

        return this.prisma.$transaction(async (tx) => {
            const request = await this.restockRequestRepo.findById(requestId);
            if (!request) throw new Error("Restock request not found.");
            if (request.serviceCenterId !== actor.serviceCenterId) {
                throw new Error("Request does not belong to your center.");
            }
            if (request.status !== RestockRequestStatus.APPROVED) {
                throw new Error("Request must be approved before receiving stock.");
            }

            const inventoryItem = await this.inventoryItemRepo.findByPartAndCenter(request.partId, actor.serviceCenterId);
            if (!inventoryItem) {
                 throw new Error("Inventory item not found for this part in your center.");
            }
            
            await this.inventoryItemRepo.update(inventoryItem.id, {
                quantityInStock: inventoryItem.quantityInStock + quantityReceived
            }, tx);
            
            // Cập nhật số lượng thực nhận nếu khác
            const updateData = { 
                status: RestockRequestStatus.COMPLETED, 
                processedAt: new Date() 
            };
            if (quantityReceived !== request.quantity) {
                updateData.notes = (request.notes || "") + `\nReceived ${quantityReceived} (Requested ${request.quantity})`;
            }

            await this.restockRequestRepo.update(requestId, updateData, tx);
            
            return inventoryItem;
        });
    }
}
module.exports = ReceiveStock;