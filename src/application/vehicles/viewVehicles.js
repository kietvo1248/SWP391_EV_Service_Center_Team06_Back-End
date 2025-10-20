const Vehicle = require('../../domain/entities/Vehicle');

class ViewVehicles {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(ownerId) {
        // 1. Tìm tất cả xe của chủ sở hữu
        const vehicles = await this.vehicleRepository.findByOwnerId(ownerId);
        // 2. Trả về danh sách các entity Vehicle
        return vehicles.map(vehicle => new Vehicle(
            vehicle.id,
            vehicle.make,
            vehicle.model,
            vehicle.year,
            vehicle.vin,
            vehicle.licensePlate,
            vehicle.ownerId
        ));
    }
}
module.exports = ViewVehicles;