const { Role, RestockRequestStatus } = require('@prisma/client');

class ImportRestock {
    constructor(restockRequestRepo, inventoryItemRepo, prismaClient) {
        this.restockRequestRepo = restockRequestRepo;
        this.inventoryItemRepo = inventoryItemRepo;
        this.prisma = prismaClient;
    }

    async execute(actor, requestId) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Lấy yêu cầu
            const request = await this.restockRequestRepo.findById(requestId);
            if (!request) throw new Error("Restock request not found.");
            
            // 2. Kiểm tra quyền và trạng thái
            if (request.serviceCenterId !== actor.serviceCenterId) throw new Error("Wrong center.");
            if (request.status !== RestockRequestStatus.APPROVED) {
                throw new Error("Request must be APPROVED to be imported.");
            }

            // 3. Cộng kho (Ràng buộc đúng số lượng trong request)
            // Tìm inventory item tương ứng
            const inventoryItem = await this.inventoryItemRepo.findByPartAndCenter(request.partId, actor.serviceCenterId);
            
            if (!inventoryItem) {
                // Trường hợp hiếm: Item bị xóa trong lúc chờ duyệt?
                throw new Error("Inventory item configuration missing. Please restore item first.");
            }

            await tx.inventoryItem.update({
                where: { id: inventoryItem.id },
                data: {
                    quantityInStock: { increment: request.quantity } // Cộng đúng số lượng đã duyệt
                }
            });

            // 4. Cập nhật trạng thái Request -> COMPLETED
            const updatedRequest = await tx.restockRequest.update({
                where: { id: requestId },
                data: {
                    status: RestockRequestStatus.COMPLETED,
                    processedAt: new Date() // Thời điểm nhập kho thực tế
                }
            });

            return updatedRequest;
        });
    }
}
module.exports = ImportRestock;