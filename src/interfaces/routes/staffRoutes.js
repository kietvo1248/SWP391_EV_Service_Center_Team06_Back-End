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

    router.put('/appointments/:id/start', controller.startAppointment.bind(controller));
    //router.put('/appointments/:id/complete', controller.completeAppointment.bind(controller));

    router.put('/appointments/:id/confirm', controller.assignAndConfirm.bind(controller));

    router.post('/service-records/:id/create-invoice', controller.createInvoice.bind(controller));

    //router.get('/service-records/:id/invoice', controller.getInvoiceDetails.bind(controller));
    
    router.post('/invoices/:id/pay-cash', controller.recordCashPayment.bind(controller));

    // --- LUỒNG 2 (Mới: Walk-in) ---
    // (Bước 1) Tìm khách hàng
    router.get('/customers/search', controller.searchCustomer.bind(controller));
    // (Bước 2.2) Tạo khách hàng mới
    router.post('/customers/create', controller.createCustomer.bind(controller));
    // (Bước 2.1a) Lấy xe của khách
    router.get('/customers/:customerId/vehicles', controller.listVehiclesForCustomer.bind(controller));
    // (Bước 2.1b) Thêm xe cho khách
    router.post('/customers/:customerId/vehicles', controller.addVehicleForCustomer.bind(controller));
    // (Bước 5 & 6) Tạo và bắt đầu lịch hẹn walk-in
    router.post('/appointments/create-walk-in', controller.createAndStartWalkInAppointment.bind(controller));

    router.put('/quotations/:id/revise', controller.reviseQuotation.bind(controller));
    
    // (L1/L2) Giao xe (sau khi COMPLETED và PAID)
    //router.put('/appointments/:id/handover', controller.handoverVehicle.bind(controller));


    return router;
};

module.exports = staffRouter;