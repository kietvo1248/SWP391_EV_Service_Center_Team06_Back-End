// Tệp: src/application/vehicles/deleteVehicle.js
class DeleteVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleId, ownerId) {
        // 1. Kiểm tra xe tồn tại
        const existingVehicle = await this.vehicleRepository.findById(vehicleId, ownerId);
        if (!existingVehicle) {
            throw new Error('Vehicle not found or you do not have permission.');
        }
        
        // 2. Thực hiện xóa mềm
        return this.vehicleRepository.softDelete(vehicleId);
    }
}
module.exports = DeleteVehicle;