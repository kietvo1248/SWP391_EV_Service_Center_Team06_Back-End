const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware'); // Middleware xác thực

const appointmentRouter = (appointmentController) => {
    const router = express.Router();

    // Lấy danh sách xe của khách hàng đã đăng nhập
    router.get('/my-vehicles', authenticate, appointmentController.getMyVehicles.bind(appointmentController));

    // Lấy gợi ý dịch vụ dựa trên model và số km
    router.get('/suggestions', authenticate, appointmentController.getSuggestions.bind(appointmentController));
    // Lấy danh sách loại dịch vụ
    router.get('/service-types', authenticate, appointmentController.listServiceTypes.bind(appointmentController));
    
    // Tạo một lịch hẹn mới
    router.post('/create-appointment', authenticate, appointmentController.create.bind(appointmentController));

    // Lấy chi tiết một lịch hẹn (Dùng chung cho Customer, Staff, Admin,...)
    router.get('/:id', authenticate, appointmentController.getAppointmentDetails.bind(appointmentController));
    // Phản hồi báo giá (chấp nhận hoặc từ chối)
    router.post('/:id/respond-quotation', authenticate, appointmentController.respondToQuotation.bind(appointmentController));

    return router;
};

module.exports = appointmentRouter;
