const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const technicianRouter = (controller) => {
    const router = express.Router();

    // Tất cả routes đều yêu cầu đăng nhập và vai trò Kỹ thuật viên
    router.use(authenticate, authorize(['TECHNICIAN']));

    // Lấy danh sách công việc (ServiceRecord) được giao
    router.get('/my-tasks', controller.listMyTasks.bind(controller));

    // Gửi chẩn đoán và báo giá
    router.post('/service-records/:id/diagnose', controller.submitDiagnosis.bind(controller));
    // Yêu cầu linh kiện cho công việc
    router.post('/service-records/:id/request-parts', controller.requestParts.bind(controller));

    // (TODO: Endpoint để hoàn thành công việc)
    router.put('/service-records/:id/complete', controller.completeTask.bind(controller));

    return router;
};

module.exports = technicianRouter;