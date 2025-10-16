class VehicleController {
    constructor(createVehicleUseCase, viewVehiclesUseCase) {
        this.createVehicleUseCase = createVehicleUseCase;
        this.viewVehiclesUseCase = viewVehiclesUseCase;
    }
    async addVehicle(req, res) {
        const { vin, make, model, year, licencePlate} = req.body;
        try {
            const ownerId = req.user.id; 
            const vehicle = await this.createVehicleUseCase.execute({
                vin,
                make,
                model,
                year,
                licencePlate,
                ownerId,
            });
            res.status(201).json(vehicle);
            console.log("Add vehicle successfully: " + vehicle.make + " " + vehicle.model + " for user ID " + ownerId);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async viewVehicles(req, res) {
        try {
            const ownerId = req.user.id;
            const vehicles = await this.viewVehiclesUseCase.execute(ownerId);
            res.status(200).json(vehicles);
            console.log("View vehicles for user ID " + ownerId);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
module.exports = VehicleController;