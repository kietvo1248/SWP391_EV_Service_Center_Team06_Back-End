// Tệp: src/interfaces/routes/appointmentRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware'); 

const appointmentRouter = (appointmentController) => {
    const router = express.Router();

    // ... (Các route /my-vehicles, /suggestions, /service-types, /history, /create-appointment, /:id giữ nguyên) ...
    router.get('/my-vehicles', authenticate, appointmentController.getMyVehicles.bind(appointmentController));
    router.get('/suggestions', authenticate, appointmentController.getSuggestions.bind(appointmentController));
    router.get('/service-types', authenticate, appointmentController.listServiceTypes.bind(appointmentController));
    router.get('/history', authenticate, appointmentController.listAppointmentHistory.bind(appointmentController));
    router.post('/create-appointment', authenticate, appointmentController.create.bind(appointmentController));
    router.get('/:id', authenticate, appointmentController.getAppointmentDetails.bind(appointmentController));

    // (XÓA) Phản hồi báo giá
    // router.put('/:id/respond-quotation', authenticate, appointmentController.respondToQuotation.bind(appointmentController));

    return router;
};

module.exports = appointmentRouter;