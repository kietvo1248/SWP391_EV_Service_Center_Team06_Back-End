// Tệp: src/application/vehicles/getVehicleDetails.js
class GetVehicleDetails {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleId, ownerId) {
        const vehicle = await this.vehicleRepository.findById(vehicleId, ownerId);
        if (!vehicle) {
            throw new Error('Vehicle not found or you do not have permission.');
        }
        return vehicle;
    }
}
module.exports = GetVehicleDetails;