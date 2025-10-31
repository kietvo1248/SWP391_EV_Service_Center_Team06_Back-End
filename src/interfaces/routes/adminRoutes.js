// Tệp: src/interfaces/routes/adminRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const adminRouter = (controller) => {
    const router = express.Router();
    router.use(authenticate, authorize(['ADMIN'])); // Chỉ Admin

    // Luồng 3.3: Duyệt nhập hàng
    router.get('/restock-requests', controller.listRestockRequests.bind(controller));
    router.put('/restock-requests/:id/approve', controller.approveRestockRequest.bind(controller));
    router.put('/restock-requests/:id/reject', controller.rejectRestockRequest.bind(controller));

    return router;
};
module.exports = adminRouter;