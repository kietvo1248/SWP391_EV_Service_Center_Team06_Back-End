// const Vehicle = require('../../domain/entities/Vehicle'); // No longer needed

class ViewVehicles {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(ownerId) {
        // 1. Tìm tất cả xe của chủ sở hữu
        const vehicles = await this.vehicleRepository.findByOwnerId(ownerId);
        // 2. Trả về danh sách các plain object (DTO) thay vì các instance của class Vehicle
        return vehicles;
    }
}
module.exports = ViewVehicles;