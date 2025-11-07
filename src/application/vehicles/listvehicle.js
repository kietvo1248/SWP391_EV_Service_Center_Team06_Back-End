class ListMyVehiclesUseCase {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    async execute(ownerId) {
        // 1. Lấy danh sách xe (đã bao gồm model và pin từ repo)
        const vehicles = await this.vehicleRepository.findByOwner(ownerId);
        
        // 2. Trả về dữ liệu
        return vehicles;
    }
}

module.exports = ListMyVehiclesUseCase;