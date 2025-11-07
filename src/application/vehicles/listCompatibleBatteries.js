// Tệp: src/application/vehicles/listCompatibleBatteries.js
class ListCompatibleBatteries {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(modelId) {
        if (!modelId) {
            throw new Error("Model ID is required.");
        }
        return this.vehicleRepository.listCompatibleBatteries(modelId);
    }
}
module.exports = ListCompatibleBatteries;