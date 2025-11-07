// Tệp: src/application/vehicles/addVehicles.js
// (Bỏ qua file Vehicle.js [cite: 1] vì logic validation đã chuyển về đây)

class AddVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    async execute(ownerId, vehicleData) {
        const { vin, year, vehicleModelId, batteryId, licensePlate, color } = vehicleData;

        // 1. Validation dữ liệu đầu vào
        if (!vin || !year || !vehicleModelId || !batteryId) {
            throw new Error('VIN, year, model, and battery are required.');
        }

        // 2. Kiểm tra VIN trùng lặp (Giữ logic từ file gốc )
        const existingVin = await this.vehicleRepository.findByVin(vin);
        if (existingVin) {
            throw new Error('Vehicle with this VIN already exists.');
        }

        // 3. Kiểm tra Biển số trùng lặp (Giữ logic từ file gốc )
        if (licensePlate) {
            const existingPlate = await this.vehicleRepository.findByLicensePlate(licensePlate);
            if (existingPlate) {
                throw new Error('Vehicle with this License Plate already exists.');
            }
        }

        // 4. (MỚI) Kiểm tra tính tương thích của Pin
        const compatibleBatteries = await this.vehicleRepository.listCompatibleBatteries(vehicleModelId);
        const isCompatible = compatibleBatteries.some(battery => battery.id === batteryId);
        if (!isCompatible) {
            throw new Error('Selected battery is not compatible with this vehicle model.');
        }

        // 5. Chuẩn bị dữ liệu
        const dataToCreate = {
            ownerId: ownerId,
            vin: vin,
            year: parseInt(year, 10),
            vehicleModelId: vehicleModelId,
            batteryId: batteryId,
            licensePlate: licensePlate,
            color: color || null,
            isDeleted: false // Mặc định khi tạo
        };

        // 6. Gọi repository để tạo
        return this.vehicleRepository.create(dataToCreate);
    }
}

module.exports = AddVehicle;