// Tệp: src/application/vehicles/listVehicleModels.js
class ListVehicleModels {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute() {
        return this.vehicleRepository.listModels();
    }
}
module.exports = ListVehicleModels;