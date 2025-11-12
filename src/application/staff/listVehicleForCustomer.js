const VehicleEntity = require('../../domain/entities/Vehicle');

class ListVehiclesForCustomer {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    async execute(customerId) {
        if (!customerId) {
            throw new Error('Customer ID is required.');
        }
        // Tái sử dụng logic repo
        const vehiclesPrisma = await this.vehicleRepository.findByOwner(customerId);
        
        // Chuyển đổi sang Entity
        return vehiclesPrisma.map(v => new VehicleEntity(v));
    }
}
module.exports = ListVehiclesForCustomer;