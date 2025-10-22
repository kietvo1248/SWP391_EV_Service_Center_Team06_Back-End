// Tệp: src/interfaces/routes/staffRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const staffRouter = (controller) => {
    const router = express.Router();

    router.use(authenticate, authorize(['STAFF', 'ADMIN', 'STATION_ADMIN']));

    router.get('/technicians', controller.listTechnicians.bind(controller));

    router.get('/appointments', controller.listAppointments.bind(controller));
    
    // Lấy chi tiết một lịch hẹn
    router.get('/appointments/:id', controller.getAppointmentDetails.bind(controller));

    router.put('/appointments/:id/confirm', controller.assignAndConfirm.bind(controller));

    return router;
};

module.exports = staffRouter;