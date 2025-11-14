// Tệp: src/interfaces/controllers/staffController.js
class StaffController {
    constructor(
        listCenterAppointmentsUseCase,
        getAppointmentDetailsUseCase, // Re-add this
        listCenterTechniciansUseCase,
        assignAndConfirmAppointmentUseCase,
        findAppointmentsByPhoneUseCase,
        startAppointmentProgressUseCase,
        createInvoiceUseCase,
        recordCashPaymentUseCase,
        //đặt lịch tại quầy
        searchCustomerUseCase,
        listVehiclesForCustomerUseCase,
        createCustomerByStaffUseCase,
        addVehicleForCustomerUseCase,
        createAndStartWalkInAppointmentUseCase,
        cancelAppointmentByStaffUseCase
        //handoverVehicleUseCase
    ) {
        this.listCenterAppointmentsUseCase = listCenterAppointmentsUseCase;
        this.getAppointmentDetailsUseCase = getAppointmentDetailsUseCase; // Assign it
        this.listCenterTechniciansUseCase = listCenterTechniciansUseCase; // Assign it
        this.assignAndConfirmAppointmentUseCase = assignAndConfirmAppointmentUseCase;
        this.findAppointmentsByPhoneUseCase = findAppointmentsByPhoneUseCase;
        this.startAppointmentProgressUseCase = startAppointmentProgressUseCase;
        this.createInvoiceUseCase = createInvoiceUseCase;
        this.recordCashPaymentUseCase = recordCashPaymentUseCase;
        this.searchCustomerUseCase = searchCustomerUseCase;
        this.listVehiclesForCustomerUseCase = listVehiclesForCustomerUseCase;
        this.createCustomerByStaffUseCase = createCustomerByStaffUseCase;
        this.addVehicleForCustomerUseCase = addVehicleForCustomerUseCase;
        this.createAndStartWalkInAppointmentUseCase = createAndStartWalkInAppointmentUseCase;
        this.cancelAppointmentByCustomerUseCase = cancelAppointmentByStaffUseCase;
        //this.handoverVehicleUseCase = handoverVehicleUseCase;
    }

    // GET /api/staff/appointments
    async listAppointments(req, res) {
        try {
            const serviceCenterId = req.user.serviceCenterId; // Từ auth middleware
            const { status } = req.query; // Lọc theo ?status=PENDING
            
            const appointments = await this.listCenterAppointmentsUseCase.execute(serviceCenterId, status);
            res.status(200).json(appointments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // GET /api/staff/appointments/:id
    async getAppointmentDetails(req, res) {
        try {
            const actor = req.user; // Pass the whole user object (actor)
            const { id } = req.params;

            const appointment = await this.getAppointmentDetailsUseCase.execute(id, actor);
            res.status(200).json(appointment);
        } catch (error) {
            if (error.message.includes('Forbidden')) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }


    // GET /api/staff/technicians
    async listTechnicians(req, res) {
        try {
            const serviceCenterId = req.user.serviceCenterId;
            const technicians = await this.listCenterTechniciansUseCase.execute(serviceCenterId);
            res.status(200).json(technicians);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // PUT /api/staff/appointments/:id/confirm
    async assignAndConfirm(req, res) {
        try {
            const serviceCenterId = req.user.serviceCenterId;
            const { id } = req.params;
            const { technicianId } = req.body;

            if (!technicianId) {
                return res.status(400).json({ message: 'Technician ID is required.' });
            }

            const result = await this.assignAndConfirmAppointmentUseCase.execute(id, technicianId, serviceCenterId);
            res.status(200).json({ message: 'Appointment confirmed and assigned successfully.', data: result });
        } catch (error) {
            // Lỗi đã được xử lý trong use case
            res.status(400).json({ message: error.message });
        }
    }

    async findAppointmentsByPhone(req, res) {
        try {
            const serviceCenterId = req.user.serviceCenterId;
            const { phone } = req.query;
            const appointments = await this.findAppointmentsByPhoneUseCase.execute(serviceCenterId, phone);
            res.status(200).json(appointments);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // PUT /api/staff/appointments/:id/start
    async startAppointment(req, res) {
        try {
            const serviceCenterId = req.user.serviceCenterId;
            const { id } = req.params;
            const { currentMileage } = req.body; // Lấy số km hiện tại từ body
            const result = await this.startAppointmentProgressUseCase.execute(id, serviceCenterId, currentMileage);
            res.status(200).json({ message: 'Appointment started.', data: result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // POST /api/staff/service-records/:id/create-invoice
    async createInvoice(req, res) {
        try {
            const serviceCenterId = req.user.serviceCenterId;
            const { id } = req.params; // Đây là ServiceRecord ID
            const invoice = await this.createInvoiceUseCase.execute(id, serviceCenterId);
            res.status(201).json(invoice);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // POST /api/staff/invoices/:id/pay-cash
    async recordCashPayment(req, res) {
        try {
            const { id } = req.params; // Đây là Invoice ID
            const updatedInvoice = await this.recordCashPaymentUseCase.execute(id);
            res.status(200).json({ message: 'Payment recorded successfully.', invoice: updatedInvoice });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // --- phương thức thứ 2, đặt lịch tại quầy ---

    // GET /api/staff/customers/search?phone=...
    async searchCustomer(req, res) {
        try {
            const { phone } = req.query;
            const customers = await this.searchCustomerUseCase.execute(phone);
            res.status(200).json(customers);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // POST /api/staff/customers
    async createCustomer(req, res) {
        try {
            const { fullName, phoneNumber, email } = req.body;
            const result = await this.createCustomerByStaffUseCase.execute({ fullName, phoneNumber, email });
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // GET /api/staff/customers/{customerId}/vehicles
    async listVehiclesForCustomer(req, res) {
        try {
            const { customerId } = req.params;
            const vehicles = await this.listVehiclesForCustomerUseCase.execute(customerId);
            res.status(200).json(vehicles);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // POST /api/staff/customers/{customerId}/vehicles
    async addVehicleForCustomer(req, res) {
        try {
            const { customerId } = req.params;
            const vehicleData = req.body;
            const actor = req.user; // Nhân viên đang thực hiện
            
            const newVehicle = await this.addVehicleForCustomerUseCase.execute(customerId, vehicleData, actor);
            res.status(201).json(newVehicle);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // POST /api/staff/appointments/create-walk-in
    async createAndStartWalkInAppointment(req, res) {
        try {
            const data = req.body; // customerId, vehicleId, technicianId, v.v.
            const actor = req.user;
            
            const result = await this.createAndStartWalkInAppointmentUseCase.execute(data, actor);
            res.status(201).json({ message: 'Walk-in appointment created and started successfully.', data: result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const actor = req.user;
            const { id } = req.params; // Appointment ID
            const updatedAppointment = await this.cancelAppointmentByStaffUseCase.execute(id, actor);
            res.status(200).json({ message: 'Lịch hẹn đã được hủy thành công.', appointment: updatedAppointment });
        } catch (error) {
            if (error.message.includes('Forbidden')) return res.status(403).json({ message: error.message });
            if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
            res.status(400).json({ message: error.message }); // Lỗi logic (vd: Hủy lịch đã COMPLETED)
        }
    }
    // PUT /api/staff/quotations/:id/revise
    // async reviseQuotation(req, res) {
    //     try {
    //         const { id } = req.params; // Quotation ID
    //         const newData = req.body; // { estimatedCost }
    //         const actor = req.user;

    //         const updatedAppointment = await this.reviseQuotationUseCase.execute(id, newData, actor);
    //         res.status(200).json({ message: 'Quotation revised. Pending customer approval.', appointment: updatedAppointment });
    //     } catch (error) {
    //         res.status(400).json({ message: error.message });
    //     }
    // }

    // PUT /api/staff/appointments/:id/handover
    // async handoverVehicle(req, res) {
    //      try {
    //         const { id } = req.params; // Appointment ID
    //         const actor = req.user;
            
    //         const result = await this.handoverVehicleUseCase.execute(id, actor);
    //         res.status(200).json(result); 
    //     } catch (error) {
    //         res.status(400).json({ message: error.message });
    //     }
    // }

}

module.exports = StaffController;