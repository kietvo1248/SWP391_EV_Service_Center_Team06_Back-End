// Tệp: src/interfaces/routes/inventoryRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const inventoryRouter = (controller) => {
    const router = express.Router();
    // Yêu cầu vai trò IM hoặc Station Admin (vì SA có thể kiêm nhiệm)
    router.use(authenticate, authorize(['INVENTORY_MANAGER', 'STATION_ADMIN']));

    // Luồng 3.1: Quản lý chung
    router.get('/items', controller.viewInventory.bind(controller));
    router.put('/items/:id/stock', controller.updateStockQuantity.bind(controller));

    // Luồng 3.2: Xuất kho cho KTV
    router.get('/issue-requests', controller.listRequestsForIssuing.bind(controller));
    router.post('/issue-requests/:serviceRecordId/issue', controller.issueParts.bind(controller));

    // Luồng 3.3: Nhập kho (Phần của IM)
    router.post('/restock-requests', controller.createRestockRequest.bind(controller));
    router.post('/items/receive-stock', controller.receiveStock.bind(controller)); 
    
    return router;
};
module.exports = inventoryRouter;