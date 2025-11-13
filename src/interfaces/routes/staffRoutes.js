// Tệp: src/interfaces/routes/staffRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const staffRouter = (controller) => {
    const router = express.Router();

    router.use(authenticate, authorize(['STAFF','CUSTOMER',  'ADMIN', 'STATION_ADMIN']));

    // ... (Các route /technicians, /appointments, /appointments/search, /appointments/:id, /appointments/:id/start, /appointments/:id/confirm, /service-records/:id/create-invoice, /invoices/:id/pay-cash giữ nguyên) ...
    router.get('/technicians', controller.listTechnicians.bind(controller));
    router.get('/appointments', controller.listAppointments.bind(controller));
    router.get('/appointments/search', controller.findAppointmentsByPhone.bind(controller));
    router.get('/appointments/:id', controller.getAppointmentDetails.bind(controller));
    router.put('/appointments/:id/start', controller.startAppointment.bind(controller));
    router.put('/appointments/:id/confirm', controller.assignAndConfirm.bind(controller));
    router.post('/service-records/:id/create-invoice', controller.createInvoice.bind(controller));
    router.post('/invoices/:id/pay-cash', controller.recordCashPayment.bind(controller));

    // ... (Luồng Walk-in giữ nguyên) ...
    router.get('/customers/search', controller.searchCustomer.bind(controller));
    router.post('/customers/create', controller.createCustomer.bind(controller));
    router.get('/customers/:customerId/vehicles', controller.listVehiclesForCustomer.bind(controller));
    router.post('/customers/:customerId/vehicles', controller.addVehicleForCustomer.bind(controller));
    router.post('/appointments/create-walk-in', controller.createAndStartWalkInAppointment.bind(controller));

    // (XÓA) Sửa đổi báo giá
    // router.put('/quotations/:id/revise', controller.reviseQuotation.bind(controller));
    
    return router;
};

module.exports = staffRouter;