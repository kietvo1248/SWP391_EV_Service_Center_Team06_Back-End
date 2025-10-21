class AppointmentController {
    constructor(createAppointmentUseCase, listMyVehiclesUseCase, getServiceSuggestionsUseCase) {
        this.createAppointmentUseCase = createAppointmentUseCase;
        this.listMyVehiclesUseCase = listMyVehiclesUseCase;
        this.getServiceSuggestionsUseCase = getServiceSuggestionsUseCase;
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
            const { vehicleModel, mileage } = req.query;
            if (!vehicleModel || !mileage) {
                return res.status(400).json({ message: "Vehicle model and mileage are required." });
            }
            const suggestions = await this.getServiceSuggestionsUseCase.execute(vehicleModel, parseInt(mileage));
            res.status(200).json(suggestions);
        } catch (error) {
            res.status(500).json({ message: error.message });
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
}

module.exports = AppointmentController;
