const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const VehicleController = require('../controllers/vehicleController');

// Hàm khởi tạo router, nhận controller làm tham số

const VehicleRouter = (vehicleController) => {
    const router = express.Router();

    // === API HỖ TRỢ (Lấy dữ liệu cho Form Thêm/Sửa xe) ===

    // Lấy danh sách Dòng xe (vd: VF8, VF9)
    router.get('/models', authenticate, authorize(['CUSTOMER', 'STAFF']), (req, res) => vehicleController.listModels(req, res));
    
    // Lấy danh sách Pin tương thích theo Dòng xe
    router.get('/models/:modelId/batteries', authenticate, authorize(['CUSTOMER', 'STAFF']), (req, res) => vehicleController.listBatteries(req, res));

    // === API CRUD CHÍNH (Tác vụ của Khách hàng) ===

    // Thêm một xe mới
    router.post('/add-vehicle', authenticate, authorize(['CUSTOMER', 'STAFF']), (req, res) => vehicleController.addVehicle(req, res));

    // Lấy danh sách xe của khách hàng (đã đăng nhập)
    router.get('/my-vehicles', authenticate, authorize(['CUSTOMER']), (req, res) => vehicleController.viewVehicles(req, res));

    // Lấy chi tiết của MỘT chiếc xe
    router.get('/vehicle-details/:id', authenticate, authorize(['CUSTOMER']), (req, res) => vehicleController.getVehicleDetails(req, res));

    // Cập nhật xe (chỉ Biển số, Màu, Loại Pin)
    router.put('/update-vehicle/:id', authenticate, authorize(['CUSTOMER']), (req, res) => vehicleController.updateVehicle(req, res));

    // Xóa (Xóa mềm) một chiếc xe
    router.delete('/delete-vehicle/:id', authenticate, authorize(['CUSTOMER']), (req, res) => vehicleController.deleteVehicle(req, res));

    return router;
}
module.exports = VehicleRouter;