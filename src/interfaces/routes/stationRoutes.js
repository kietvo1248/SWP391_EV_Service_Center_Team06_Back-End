// Tệp: src/interfaces/routes/stationRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const stationRouter = (controller) => {
    const router = express.Router();

    // Middleware bảo vệ chung cho toàn bộ router này
    // (Swagger định nghĩa tất cả các API này đều cần xác thực)
    router.use(authenticate);

    // --- 1. Quản lý Nhân sự ---
    
    // API: GET /api/station/stations/{stationId}/staff
    // Chức năng: (L6.1) Lấy danh sách nhân viên tại trạm
    router.get(
        '/stations/:stationId/staff',
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.listStaff(req, res)
    );

    // API: PUT /api/station/stations/{stationId}/staff/{staffId}/status
    // Chức năng: (L6.2) Cập nhật trạng thái nhân viên
    router.put(
        '/stations/:stationId/staff/:staffId/status',
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.updateStaffStatus(req, res)
    );

    // API: PUT /api/station/stations/{stationId}/technicians/{technicianId}/specialization
    // Chức năng: (L6.6) Cập nhật chuyên môn KTV
    router.put(
        '/stations/:stationId/technicians/:technicianId/specialization',
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.updateTechnicianSpecification(req, res)
    );

    // --- 2. Quản lý Chứng chỉ ---

    // API: GET /api/station/certifications
    // Chức năng: (L6.3) Lấy danh sách tất cả chứng chỉ
    router.get(
        '/certifications', 
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.listAllCerts(req, res)
    ); 

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
    router.get(
        '/stations/:stationId/reports/revenue',
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.getRevenueReport(req, res)
    );

    // API: GET /api/station/stations/{stationId}/reports/technician-performance
    // Chức năng: (L6.8) Báo cáo hiệu suất KTV
    router.get(
        '/stations/:stationId/reports/technician-performance',
        authorize(['STATION_ADMIN', 'ADMIN']), 
        (req, res) => controller.getPerformanceReport(req, res)
    );


    return router;
};

module.exports = stationRouter;