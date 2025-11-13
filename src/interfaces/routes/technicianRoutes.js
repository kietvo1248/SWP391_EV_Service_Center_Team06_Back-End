// Tệp: src/interfaces/routes/technicianRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const technicianRouter = (controller) => {
    const router = express.Router();

    router.use(authenticate, authorize(['TECHNICIAN']));

    // Lấy danh sách công việc
    router.get('/my-tasks', controller.listMyTasks.bind(controller));
    router.put('/service-records/:id/accept', controller.acceptTask.bind(controller));

    // (XÓA) Gửi chẩn đoán và báo giá
    // router.post('/service-records/:id/diagnose', controller.submitDiagnosis.bind(controller));
    
    // (SỬA) Đổi tên route cho rõ nghĩa: KTV "sử dụng" phụ tùng (tự động trừ kho)
    router.post('/service-records/:id/use-parts', controller.useParts.bind(controller));

    // Hoàn thành công việc
    router.put('/service-records/:id/complete', controller.completeTask.bind(controller));

    // GET /api/technician/inventory (Xem tất cả)
    router.get('/inventory', controller.viewInventory.bind(controller));
    
    // GET /api/technician/inventory/search?sku=... (Tìm theo SKU)
    router.get('/inventory/search', controller.findPartBySku.bind(controller));

    return router;
};

module.exports = technicianRouter;