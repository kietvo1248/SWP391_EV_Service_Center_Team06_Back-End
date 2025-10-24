// Tệp: src/interfaces/routes/staffRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const staffRouter = (controller) => {
    const router = express.Router();

    router.use(authenticate, authorize(['STAFF', 'ADMIN', 'STATION_ADMIN']));

    router.get('/technicians', controller.listTechnicians.bind(controller));

    router.get('/appointments', controller.listAppointments.bind(controller));
    
    router.get('/appointments/search', controller.findAppointmentsByPhone.bind(controller));

    // Lấy chi tiết một lịch hẹn cho Staff
    router.get('/appointments/:id', controller.getAppointmentDetails.bind(controller));

    router.put('/appointments/:id/confirm', controller.assignAndConfirm.bind(controller));

    router.post('/service-records/:id/create-invoice', controller.createInvoice.bind(controller));

    return router;
};

module.exports = staffRouter;