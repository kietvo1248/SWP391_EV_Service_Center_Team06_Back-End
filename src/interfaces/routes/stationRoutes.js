// Tệp: src/interfaces/routes/stationRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const stationRouter = (controller) => {
    const router = express.Router();

    const authorize_SA_ADMIN = authorize(['STATION_ADMIN', 'ADMIN']);
    const authorize_SA = authorize(['STATION_ADMIN']);

    // Middleware bảo vệ chung cho toàn bộ router này
    // (Swagger định nghĩa tất cả các API này đều cần xác thực)
    router.use(authenticate);

    // --- 1. Quản lý Nhân sự ---
    
    // API: GET /api/station/stations/{stationId}/staff
    // Chức năng: (L6.1) Lấy danh sách nhân viên tại trạm
    router.get('/staff', authorize_SA_ADMIN, controller.listStaff.bind(controller));

    router.get('/staff/:staffId', authorize_SA, controller.getStaffDetails.bind(controller));

    // API: PUT /api/station/stations/{stationId}/staff/{staffId}/status
    // Chức năng: (L6.2) Cập nhật trạng thái nhân viên
    router.put('/staff/:staffId/status', authorize_SA_ADMIN, controller.updateStaffStatus.bind(controller));

    // API: PUT /api/station/stations/{stationId}/technicians/{technicianId}/specialization
    // Chức năng: (L6.6) Cập nhật chuyên môn KTV
    router.put('/technicians/:technicianId/specialization', authorize_SA_ADMIN, controller.updateTechnicianSpecification.bind(controller));

    // --- 2. Quản lý Chứng chỉ ---

    // (CRUD Master Data)
    router.get('/certifications', authorize_SA_ADMIN, controller.listAllCerts.bind(controller));
    router.post('/certifications', authorize_SA_ADMIN, controller.createCertification.bind(controller));
    router.put('/certifications/:id', authorize_SA_ADMIN, controller.updateCertification.bind(controller));
    router.delete('/certifications/:id', authorize_SA_ADMIN, controller.deleteCertification.bind(controller)); 

    // API: POST /api/station/technicians/{technicianId}/certifications
    // Chức năng: (L6.4) Gán chứng chỉ cho KTV
    router.post(
        '/technicians/:technicianId/certifications', 
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.assignCert(req, res)
    ); 

    // API: DELETE /api/station/technicians/{technicianId}/certifications/{certificationId}
    // Chức năng: (L6.5) Thu hồi chứng chỉ của KTV
    router.delete(
        '/technicians/:technicianId/certifications/:certificationId', 
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.revokeCert(req, res)
    );

    // --- 3. Báo cáo (Reporting) ---

    // API: GET /api/station/stations/{stationId}/reports/revenue
    // Chức năng: (L6.7) Báo cáo doanh thu
   // (SỬA) GET /api/station/reports/revenue (Bỏ {stationId})
    router.get('/reports/revenue', authorize_SA_ADMIN, controller.getRevenueReport.bind(controller));

    // (SỬA) GET /api/station/reports/technician-performance (Bỏ {stationId})
    router.get('/reports/technician-performance', authorize_SA_ADMIN, controller.getPerformanceReport.bind(controller));


    return router;
};

module.exports = stationRouter;