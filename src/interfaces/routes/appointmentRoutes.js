const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware'); // Middleware xác thực

const appointmentRouter = (appointmentController) => {
    const router = express.Router();

    // Lấy danh sách xe của khách hàng đã đăng nhập
    router.get('/my-vehicles', authenticate, appointmentController.getMyVehicles.bind(appointmentController));

    // Lấy gợi ý dịch vụ dựa trên model và số km
    router.get('/suggestions', authenticate, appointmentController.getSuggestions.bind(appointmentController));
    
    // Tạo một lịch hẹn mới
    router.post('/', authenticate, appointmentController.create.bind(appointmentController));

    return router;
};

module.exports = appointmentRouter;
