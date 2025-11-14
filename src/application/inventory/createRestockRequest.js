// Tệp: src/application/inventory/createRestockRequest.js
const { Role } = require('@prisma/client');

class CreateRestockRequest {
    constructor(restockRequestRepository, partRepository) {
        this.restockRequestRepo = restockRequestRepository;
        this.partRepo = partRepository;
    }

    async execute(data, actor) {
        const { partId, quantity, notes } = data;

        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }
        
        // 1. Lấy thông tin Part (bao gồm giá)
        const part = await this.partRepo.findById(partId); 
        if (!part) throw new Error("Part not found.");
        if (quantity <= 0) throw new Error("Quantity must be positive.");

        // 2. (SỬA) Gọi hàm 'create' với thông tin 'unitPrice'
        // 'part.price' chính là "thời giá hiện tại"
        const newRequest = await this.restockRequestRepo.create({
            partId: partId,
            quantity: quantity,
            unitPrice: part.price, // <-- GHI LẠI GIÁ LỊCH SỬ
            notes: notes || null, 
            inventoryManagerId: actor.id,
            serviceCenterId: actor.serviceCenterId,
            status: 'PENDING',
        });

        // 3. (SỬA) Tính toán tổng tiền dựa trên 'unitPrice' đã lưu
        const totalPrice = Number(newRequest.unitPrice) * newRequest.quantity;

        // Trả về đối tượng đã-tính-toán
        return {
            ...newRequest,
            totalPrice: totalPrice // Thêm trường mới vào response
        };
    }
}
module.exports = CreateRestockRequest;