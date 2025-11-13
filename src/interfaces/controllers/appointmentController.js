// Tệp: src/interfaces/controllers/appointmentController.js
class AppointmentController {
    constructor(
        createAppointmentUseCase, 
        listMyVehiclesUseCase, 
        getServiceSuggestionsUseCase, 
        listServiceTypesUseCase, 
        getAppointmentDetailsUseCase, 
        // respondToQuotationUseCase, // (XÓA)
        listAppointmentHistoryUseCase
    ) {
        this.createAppointmentUseCase = createAppointmentUseCase;
        this.listMyVehiclesUseCase = listMyVehiclesUseCase;
        this.getServiceSuggestionsUseCase = getServiceSuggestionsUseCase;
        this.listServiceTypesUseCase = listServiceTypesUseCase;
        this.getAppointmentDetailsUseCase = getAppointmentDetailsUseCase;
        // this.respondToQuotationUseCase = respondToQuotationUseCase; // (XÓA)
        this.listAppointmentHistoryUseCase = listAppointmentHistoryUseCase;
    }

    // ... (getMyVehicles, getSuggestions, create, listServiceTypes, getAppointmentDetails, listAppointmentHistory giữ nguyên) ...
    // ... (Lưu ý: phương thức 'create' sẽ nhận 'servicePackageId' từ body thay vì 'requestedServices')
    async getMyVehicles(req, res) {
        try {
            const ownerId = req.user.id; 
            const vehicles = await this.listMyVehiclesUseCase.execute(ownerId);
            res.status(200).json(vehicles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSuggestions(req, res) {
        try {
            const { vehicleId } = req.query;
            const ownerId = req.user.id;
            
            if (!vehicleId) {
                return res.status(400).json({ message: "Vehicle ID is required." });
            }

            const suggestions = await this.getServiceSuggestionsUseCase.execute({ 
                vehicleId: vehicleId, 
                ownerId: ownerId    
            });
            
            res.status(200).json(suggestions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
        }
    }

    async create(req, res) {
        try {
            const customerId = req.user.id;
            const appointmentData = req.body; // body giờ nên chứa 'servicePackageId'
            const newAppointment = await this.createAppointmentUseCase.execute(appointmentData, customerId);
            res.status(201).json({ message: "Appointment created successfully.", appointment: newAppointment });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async listServiceTypes(req, res) { 
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
            const actor = req.user; 
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

    // (XÓA) Xóa phương thức 'respondToQuotation'
    /*
    async respondToQuotation(req, res) { ... }
    */

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