// Tệp: src/application/inventory/ListRestockRequests.js
// (SỬA LẠI) - Dành cho IM và SA xem yêu cầu tại trạm của mình
const { Role } = require('@prisma/client');

class ListRestockRequests {
    constructor(restockRequestRepository) {
        this.restockRequestRepo = restockRequestRepository;
    }
    
    async execute(status, actor) {
        // 1. Kiểm tra vai trò (IM và SA)
        const allowedRoles = [Role.INVENTORY_MANAGER, Role.STATION_ADMIN];
        if (!allowedRoles.includes(actor.role)) {
            throw new Error("Forbidden.");
        }

        // 2. Kiểm tra trung tâm
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }
        
        // 3. Lọc theo trung tâm của người dùng
        // Hàm findByCenter (trong Repo) đã include 'part' (để lấy tên)
        // và tự động lấy các trường 'quantity', 'unitPrice'
        const requests = await this.restockRequestRepo.findByCenter(actor.serviceCenterId, status); 

        // 4. (THÊM MỚI) Tính toán tổng tiền cho mỗi yêu cầu
        return requests.map(request => {
            
            // Tính tổng tiền dựa trên Đơn giá (unitPrice) đã lưu
            // (Chúng ta đã lưu unitPrice trong CSDL ở bước trước)
            const totalPrice = Number(request.unitPrice) * request.quantity;
            
            return {
                ...request, // Giữ lại toàn bộ thông tin (id, status, part, v.v.)
                totalPrice: totalPrice // Thêm trường 'totalPrice' đã tính toán
            };
        });
    }
}
module.exports = ListRestockRequests;