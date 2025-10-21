const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const VehicleController = require('../controllers/vehicleController');

// Hàm khởi tạo router, nhận controller làm tham số

const VehicleRouter = (vehicleController) => {
    const router = express.Router();
    // vehicle management routes
    //router.post('/add', authenticate, authorize(['STAFF', 'TECHNICIAN', 'INVENTORY_MANAGER', 'ADMIN', 'STATION_ADMIN']), (req, res) => vehicleController.addVehicle(req, res));
    router.post('/add-vehicle', authenticate, authorize(['CUSTOMER', 'STAFF']), (req, res) => vehicleController.addVehicle(req, res));
    router.get('/my-vehicles', authenticate, authorize(['CUSTOMER']), (req, res) => vehicleController.viewVehicles(req, res));


    return router;
}
module.exports = VehicleRouter;