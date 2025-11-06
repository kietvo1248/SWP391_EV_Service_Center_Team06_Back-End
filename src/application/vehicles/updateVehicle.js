// Tệp: src/application/vehicles/updateVehicle.js
class UpdateVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleId, ownerId, updateData) {
        // 1. Kiểm tra xe tồn tại
        const existingVehicle = await this.vehicleRepository.findById(vehicleId, ownerId);
        if (!existingVehicle) {
            throw new Error('Vehicle not found or you do not have permission.');
        }

        // 2. Lọc dữ liệu: Chỉ cho phép 3 trường như yêu cầu
        const dataToUpdate = {
            licensePlate: updateData.licensePlate,
            color: updateData.color,
            batteryId: updateData.batteryId,
        };

        // 3. (MỚI) Kiểm tra Pin tương thích (nếu pin bị thay đổi)
        if (dataToUpdate.batteryId && dataToUpdate.batteryId !== existingVehicle.batteryId) {
            const compatibleBatteries = await this.vehicleRepository.listCompatibleBatteries(existingVehicle.vehicleModelId);
            const isCompatible = compatibleBatteries.some(battery => battery.id === dataToUpdate.batteryId);
            if (!isCompatible) {
                throw new Error('Selected battery is not compatible with this vehicle model.');
            }
        }

        // 4. Kiểm tra Biển số trùng lặp (nếu biển số bị thay đổi)
        if (dataToUpdate.licensePlate && dataToUpdate.licensePlate !== existingVehicle.licensePlate) {
             const existingPlate = await this.vehicleRepository.findByLicensePlate(dataToUpdate.licensePlate);
             if (existingPlate) {
                throw new Error('Vehicle with this License Plate already exists.');
             }
        }

        // 5. Thực hiện cập nhật
        return this.vehicleRepository.update(vehicleId, dataToUpdate);
    }
}
module.exports = UpdateVehicle;