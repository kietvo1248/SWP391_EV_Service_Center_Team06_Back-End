class VehicleController {
    constructor(createVehicleUseCase, viewVehiclesUseCase) {
        this.createVehicleUseCase = createVehicleUseCase;
        this.viewVehiclesUseCase = viewVehiclesUseCase;
    }
    async addVehicle(req, res) {
        // --- SỬA ĐỔI Ở ĐÂY ---
        // 1. Sửa 'licencePlate' thành 'licensePlate'
        // 2. Thêm 'currentMileage' vào destructuring
        const { vin, brand, model, year, licensePlate, currentMileage, color } = req.body;
        // --- KẾT THÚC SỬA ĐỔI ---

        try {
            const ownerId = req.user.id;
            const vehicle = await this.createVehicleUseCase.execute({
                vin,
                brand,
                model,
                year,
                licensePlate,    
                currentMileage, 
                color, 
                ownerId,
            });
            res.status(201).json(vehicle);
            console.log("Add vehicle successfully: " + vehicle.brand + " " + vehicle.model + " for user ID " + ownerId);
        } catch (error) {
            // Nên log lỗi chi tiết hơn ở server
            console.error("Error adding vehicle:", error);
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