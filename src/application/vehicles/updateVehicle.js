// Tệp: src/application/vehicles/updateVehicle.js
const { Prisma } = require('@prisma/client'); // Import Prisma để bắt lỗi

class UpdateVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    async execute(vehicleId, ownerId, updateData) {
        try {
            // 1. Kiểm tra xe tồn tại (Giữ nguyên)
            const existingVehicle = await this.vehicleRepository.findById(vehicleId, ownerId);
            if (!existingVehicle) {
                throw new Error('Vehicle not found or you do not have permission.');
            }

            // 2. Lọc dữ liệu (Giữ nguyên)
            const dataToUpdate = {
                licensePlate: updateData.licensePlate,
                color: updateData.color,
                batteryId: updateData.batteryId,
            };

            // 3. Kiểm tra Pin tương thích (Giữ nguyên)
            if (dataToUpdate.batteryId && dataToUpdate.batteryId !== existingVehicle.batteryId) {
                const compatibleBatteries = await this.vehicleRepository.listCompatibleBatteries(existingVehicle.vehicleModelId);
                const isCompatible = compatibleBatteries.some(battery => battery.id === dataToUpdate.batteryId);
                if (!isCompatible) {
                    throw new Error('Selected battery is not compatible with this vehicle model.');
                }
            }

            // 5. Thực hiện cập nhật
            return this.vehicleRepository.update(vehicleId, dataToUpdate);

        } catch (error) {
            
            // --- (SỬA LỖI TOCTOU) ---
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                if (error.meta && error.meta.target.includes('licensePlate')) {
                    throw new Error('Vehicle with this License Plate already exists.');
                }
                throw new Error('A unique constraint was violated.');
            }
            throw error;
        }
    }
}

module.exports = UpdateVehicle;