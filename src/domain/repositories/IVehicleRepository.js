class IVehicleRepository {
    async create(vehicleData) {
        throw new Error('Method not implemented');
    }
    async findByVin(vin) {
        throw new Error('Method not implemented');
    }
    async findByOwnerId(ownerId) {
        throw new Error('Method not implemented');
    }
}

module.exports = IVehicleRepository;