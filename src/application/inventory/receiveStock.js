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

        // Giao dịch (transaction) vẫn rất quan trọng để nhóm 2 thao tác (cập nhật kho và cập nhật yêu cầu)
        return this.prisma.$transaction(async (tx) => {
            
            // Bước 1: Lấy thông tin Yêu cầu (RestockRequest)
            // (Logic này của bạn đã đúng)
            const request = await this.restockRequestRepo.findById(requestId); //
            if (!request) throw new Error("Restock request not found."); //
            if (request.serviceCenterId !== actor.serviceCenterId) { //
                throw new Error("Request does not belong to your center.");
            }
            if (request.status !== RestockRequestStatus.APPROVED) { //
                throw new Error("Request must be approved before receiving stock.");
            }

            // --- SỬA LỖI RACE CONDITION ---
            // Bỏ qua bước ĐỌC (findByPartAndCenter) và TÍNH TOÁN
            // Thay bằng một lệnh CẬP NHẬT NGUYÊN TỬ (Atomic Update)
            
            const updateResult = await tx.inventoryItem.updateMany({
                where: {
                    partId: request.partId, // Lấy partId từ yêu cầu
                    serviceCenterId: actor.serviceCenterId // Lấy centerId từ người dùng
                },
                data: {
                    quantityInStock: {
                        increment: quantityReceived // Yêu cầu CSDL tự cộng dồn
                    }
                }
            });

            // Nếu updateResult.count = 0, nghĩa là kho hàng không tồn tại
            if (updateResult.count === 0) {
                 // Lỗi này tương tự lỗi logic cũ của bạn, nhưng giờ nó an toàn
                 throw new Error("Inventory item not found for this part in your center.");
            }
            // --- KẾT THÚC SỬA LỖI ---
            
            // Bước 3: Cập nhật trạng thái Yêu cầu (Logic này của bạn đã đúng)
            const updateData = { 
                status: RestockRequestStatus.COMPLETED, 
                processedAt: new Date() 
            };
            if (quantityReceived !== request.quantity) { //
                updateData.notes = (request.notes || "") + `\nReceived ${quantityReceived} (Requested ${request.quantity})`; //
            }

            const updatedRequest = await this.restockRequestRepo.update(requestId, updateData, tx); //
            
            // Trả về yêu cầu đã cập nhật (an toàn hơn trả về inventoryItem cũ)
            return updatedRequest;
        });
    }
}
module.exports = ReceiveStock;