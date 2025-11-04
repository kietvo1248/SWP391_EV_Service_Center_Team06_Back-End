class AppointmentController {
    constructor(createAppointmentUseCase, listMyVehiclesUseCase, getServiceSuggestionsUseCase, listServiceTypesUseCase, getAppointmentDetailsUseCase, respondToQuotationUseCase, listAppointmentHistoryUseCase) {
        this.createAppointmentUseCase = createAppointmentUseCase;
        this.listMyVehiclesUseCase = listMyVehiclesUseCase;
        this.getServiceSuggestionsUseCase = getServiceSuggestionsUseCase;
        this.listServiceTypesUseCase = listServiceTypesUseCase;
        this.getAppointmentDetailsUseCase = getAppointmentDetailsUseCase;
        this.respondToQuotationUseCase = respondToQuotationUseCase;
        this.listAppointmentHistoryUseCase = listAppointmentHistoryUseCase;
    }

    async getMyVehicles(req, res) {
        try {
            const ownerId = req.user.id; // Lấy từ auth middleware
            const vehicles = await this.listMyVehiclesUseCase.execute(ownerId);
            res.status(200).json(vehicles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSuggestions(req, res) {
        try {
            // Lấy 'mileage' và 'model' từ query string
            const { mileage, model } = req.query;
            
            if (!mileage || !model) {
                return res.status(400).json({ message: "Mileage and model parameters are required." });
            }

            const suggestions = await this.getServiceSuggestionsUseCase.execute({ 
                mileage: Number(mileage), // Chuyển sang số
                model: model 
            });
            
            res.status(200).json(suggestions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
        }
    }

    async create(req, res) {
        try {
            const customerId = req.user.id;
            const appointmentData = req.body;
            const newAppointment = await this.createAppointmentUseCase.execute(appointmentData, customerId);
            res.status(201).json({ message: "Appointment created successfully.", appointment: newAppointment });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async listServiceTypes(req, res) { // xem dịch vụ khi tạo appointment
        try {
            const serviceTypes = await this.listServiceTypesUseCase.execute();
            res.status(200).json(serviceTypes);
        } catch (error) {
            console.error('Error listing service types:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

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
    async respondToQuotation(req, res) {
        try {
            const customerId = req.user.id;
            const { id } = req.params;
            const { didAccept } = req.body;
            const result = await this.respondToQuotationUseCase.execute(id, customerId, didAccept);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // GET /api/appointments/history
    async listAppointmentHistory(req, res) {
        try {
            const customerId = req.user.id;
            const history = await this.listAppointmentHistoryUseCase.execute(customerId);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AppointmentController;
