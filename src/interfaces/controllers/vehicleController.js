class VehicleController {
    constructor(addVehicleUseCase,
        listVehicleUseCase,
        getVehicleDetailsUseCase,
        updateVehicleUseCase,
        deleteVehicleUseCase,
        listVehicleModelsUseCase,
        listCompatibleBatteriesUseCase) {
        this.addVehicleUseCase = addVehicleUseCase;
        this.viewVehiclesUseCase = listVehicleUseCase;
        this.getVehicleDetailsUseCase = getVehicleDetailsUseCase;
        this.updateVehicleUseCase = updateVehicleUseCase;
        this.deleteVehicleUseCase = deleteVehicleUseCase;
        this.listVehicleModelsUseCase = listVehicleModelsUseCase;
        this.listCompatibleBatteriesUseCase = listCompatibleBatteriesUseCase;
    }
    async listModels(req, res) {
        try {
            const models = await this.listVehicleModelsUseCase.execute();
            res.status(200).json(models);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // (MỚI) GET /models/:modelId/batteries -> Hỗ trợ UI cho việc Thêm/Sửa
    async listBatteries(req, res) {
        try {
            const { modelId } = req.params;
            const batteries = await this.listCompatibleBatteriesUseCase.execute(modelId);
            res.status(200).json(batteries);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // (CẬP NHẬT) POST /
    async addVehicle(req, res) {
        try {
            const ownerId = req.user.id; // Lấy từ passport/JWT
            // Dữ liệu mới dựa trên schema
            const { vin, year, vehicleModelId, batteryId, licensePlate, color } = req.body;
            
            const vehicle = await this.addVehicleUseCase.execute(ownerId, {
                vin,
                year,
                vehicleModelId,
                batteryId,
                licensePlate,
                color,
            });
            res.status(201).json(vehicle);
        } catch (error) {
            console.error("Error adding vehicle:", error);
            res.status(400).json({ message: error.message });
        }
    }

    // (CẬP NHẬT) GET /
    async viewVehicles(req, res) {
        try {
            const ownerId = req.user.id;
            const vehicles = await this.viewVehiclesUseCase.execute(ownerId);
            res.status(200).json(vehicles);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // (MỚI) GET /:id
    async getVehicleDetails(req, res) {
        try {
            const ownerId = req.user.id;
            const { id } = req.params;
            const vehicle = await this.getVehicleDetailsUseCase.execute(id, ownerId);
            res.status(200).json(vehicle);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    // (MỚI) PUT /:id
    async updateVehicle(req, res) {
        try {
            const ownerId = req.user.id;
            const { id } = req.params;
            // Chỉ lấy 3 trường được phép cập nhật
            const { licensePlate, color, batteryId } = req.body;

            const updatedVehicle = await this.updateVehicleUseCase.execute(id, ownerId, {
                licensePlate,
                color,
                batteryId
            });
            res.status(200).json(updatedVehicle);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // (MỚI) DELETE /:id
    async deleteVehicle(req, res) {
        try {
            const ownerId = req.user.id;
            const { id } = req.params;
            await this.deleteVehicleUseCase.execute(id, ownerId);
            res.status(204).send(); // 204 No Content - Xóa thành công
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
module.exports = VehicleController;