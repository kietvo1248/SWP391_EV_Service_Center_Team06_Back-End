// Tệp: src/interfaces/controllers/staffController.js
class StaffController {
    constructor(
        listCenterAppointmentsUseCase,
        getAppointmentDetailsUseCase,
        listCenterTechniciansUseCase,
        assignAndConfirmAppointmentUseCase
    ) {
        this.listCenterAppointmentsUseCase = listCenterAppointmentsUseCase;
        this.getAppointmentDetailsUseCase = getAppointmentDetailsUseCase;
        this.listCenterTechniciansUseCase = listCenterTechniciansUseCase;
        this.assignAndConfirmAppointmentUseCase = assignAndConfirmAppointmentUseCase;
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
            const serviceCenterId = req.user.serviceCenterId;
            const { id } = req.params;

            const appointment = await this.getAppointmentDetailsUseCase.execute(id, serviceCenterId);
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
}

module.exports = StaffController;