const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const inventoryRouter = (controller) => {
    const router = express.Router();
    const authorize_IM_SA = authorize(['INVENTORY_MANAGER', 'STATION_ADMIN']);
    const authorize_SA = authorize(['STATION_ADMIN']); // Chỉ Station Admin
    const authorize_IM = authorize(['INVENTORY_MANAGER']); // Chỉ Inventory Manager

    router.use(authenticate);

    // ... (Các routes Quản lý kho cũ giữ nguyên: /items, /items/search, v.v...)
    router.get('/items', authorize(['INVENTORY_MANAGER', 'STATION_ADMIN', 'TECHNICIAN']), controller.viewInventory.bind(controller));
    router.get('/items/search', authorize(['INVENTORY_MANAGER', 'STATION_ADMIN', 'TECHNICIAN']), controller.findPartBySku.bind(controller));
    router.get('/items/low-stock', authorize_IM_SA, controller.listLowStock.bind(controller));
    router.post('/items/create', authorize_IM, controller.addInventoryItem.bind(controller));
    router.get('/items/:id', authorize(['INVENTORY_MANAGER', 'STATION_ADMIN', 'TECHNICIAN']), controller.getInventoryItemDetails.bind(controller));
    router.put('/items/:id/update', authorize_IM, controller.updateInventoryItem.bind(controller));
    router.delete('/items/:id/remove', authorize_IM, controller.removeInventoryItem.bind(controller));

    // --- 2. QUY TRÌNH NHẬP HÀNG (Restock) ---

    // Tạo yêu cầu (IM, SA)
    router.post('/restock-requests', authorize_IM_SA, controller.createRestockRequest.bind(controller));

    // Xem danh sách yêu cầu (IM, SA)
    router.get('/restock-requests', authorize_IM_SA, controller.listRestockRequests.bind(controller));

    // --- THÊM MỚI: Phê duyệt (Chỉ Station Admin) ---
    
    // Duyệt yêu cầu
    router.put('/restock-requests/:id/approve', authorize_SA, controller.approveRestockRequest.bind(controller));
    
    // Từ chối yêu cầu
    router.put('/restock-requests/:id/reject', authorize_SA, controller.rejectRestockRequest.bind(controller));


    // Nhập kho (Khi đã Approved - IM thực hiện)
    router.post('/restock-requests/:requestId/import', authorize_IM_SA, controller.importRestock.bind(controller));
    
    return router;
};
module.exports = inventoryRouter;