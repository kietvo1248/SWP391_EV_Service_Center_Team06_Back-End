// Tệp: src/interfaces/routes/serviceCenterRoutes.js

const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware'); // Import middleware xác thực

const serviceCenterRouter = (controller) => {
    const router = express.Router();

    router.get('/', authenticate, controller.listAll.bind(controller));
    router.get('/:id/available-slots',authenticate,controller.getAvailableSlots.bind(controller));

    // TODO: Thêm route GET /:id/available-slots
    // (Đây sẽ là bước tiếp theo để lấy các khung giờ trống)

    return router;
};

module.exports = serviceCenterRouter;