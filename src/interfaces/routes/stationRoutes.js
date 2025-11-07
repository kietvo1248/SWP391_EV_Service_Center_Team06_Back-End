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

    return router;
};

module.exports = stationRouter;