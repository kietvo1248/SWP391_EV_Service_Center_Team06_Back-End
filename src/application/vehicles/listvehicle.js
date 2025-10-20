class ListMyVehiclesUseCase {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    async execute(ownerId) {
        return this.vehicleRepository.findByOwnerId(ownerId);
    }
}

module.exports = ListMyVehiclesUseCase;