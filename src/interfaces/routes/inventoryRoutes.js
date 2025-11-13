// Tệp: src/interfaces/routes/inventoryRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const inventoryRouter = (controller) => {
    const router = express.Router();
    
    // (SỬA) Phân quyền phức tạp hơn:
    // KTV chỉ được xem, IM/SA được làm tất cả
    // Chúng ta sẽ áp dụng middleware chung cho IM/SA
    // và áp dụng middleware riêng cho KTV ở route GET
    
    // Middleware cho IM & SA
    const authorize_IM_SA = authorize(['INVENTORY_MANAGER', 'STATION_ADMIN']);

    // Luồng 3.1: Quản lý chung
    router.get('/items', authenticate, authorize(['INVENTORY_MANAGER', 'STATION_ADMIN', 'TECHNICIAN']), controller.viewInventory.bind(controller));
    router.put('/items/:id/stock', authenticate, authorize_IM_SA, controller.updateStockQuantity.bind(controller));

    // (THÊM MỚI) Tìm kiếm SKU cho IM/SA
    router.get('/items/search', authenticate, authorize(['INVENTORY_MANAGER', 'STATION_ADMIN', 'TECHNICIAN']), controller.findPartBySku.bind(controller));


    // Luồng 3.3: Nhập kho (Chỉ IM/SA)
    router.post('/restock-requests', authenticate, authorize_IM_SA, controller.createRestockRequest.bind(controller));
    router.post('/items/receive-stock', authenticate, authorize_IM_SA, controller.receiveStock.bind(controller)); 
    
    return router;
};

module.exports = inventoryRouter;