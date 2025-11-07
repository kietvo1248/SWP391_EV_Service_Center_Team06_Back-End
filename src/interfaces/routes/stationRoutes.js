// Tệp: src/interfaces/routes/stationRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const stationRouter = (controller) => {
    const router = express.Router();
    // Bảo vệ tất cả API
    router.use(authenticate, authorize(['STATION_ADMIN', 'ADMIN']));

    // 1. Quản lý nhân viên
    router.get('/staff', controller.listStaff.bind(controller));
    router.put('/staff/:staffId/status', controller.updateStaffStatus.bind(controller));
    router.put('/stations/:stationId/technicians/:technicianId/specialization',controller.updateTechnicianSpecification.bind(controller));

    // 2. Cập nhật chứng chỉ
    router.get('/certifications', controller.listAllCerts.bind(controller)); 
    router.post('/staff/:staffId/certifications', controller.assignCert.bind(controller)); 
    router.delete('/staff/:staffId/certifications/:certificationId', controller.revokeCert.bind(controller));

    // 3. Báo cáo, Thống kê
    router.get('/reports/revenue', controller.getRevenueReport.bind(controller));
    router.get('/reports/performance', controller.getPerformanceReport.bind(controller));

    // Duyệt Yêu cầu Nhập hàng (Dành cho Station Admin)
    router.put('/restock-requests/:id/approve', authenticate, authorize(['STATION_ADMIN']), (req, res) => controller.approveRestockRequest(req, res));

    // Từ chối Yêu cầu Nhập hàng (Dành cho Station Admin)
    router.put('/restock-requests/:id/reject', authenticate, authorize(['STATION_ADMIN']), (req, res) => controller.rejectRestockRequest(req, res));

    return router;
};

module.exports = stationRouter;