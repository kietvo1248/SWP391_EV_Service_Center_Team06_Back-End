// Tệp: src/application/vehicles/addVehicles.js
const VehicleEntity = require('../../domain/entities/Vehicle');

class AddVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleData) {
        // 1. Kiểm tra VIN
        const existingVehicle = await this.vehicleRepository.findByVin(vehicleData.vin);
        if (existingVehicle) {
            throw new Error('Vehicle with this VIN already exists.');
        }
        // soi biển số
        if (vehicleData.licensePlate) {
            const existingLicensePlate = await this.vehicleRepository.findByLicensePlate(vehicleData.licensePlate);
            if (existingLicensePlate) {
                throw new Error('Vehicle with this License Plate already exists.');
            }
        }

        // --- SỬA ĐỔI Ở ĐÂY ---
        // 2. Chuẩn bị dữ liệu để tạo trong DB, đảm bảo currentMileage là số hoặc 0
        let mileage = vehicleData.currentMileage !== undefined && vehicleData.currentMileage !== null
                      ? parseInt(vehicleData.currentMileage, 10)
                      : 0; // Mặc định là 0 nếu không có hoặc null

        // Kiểm tra nếu parseInt trả về NaN (ví dụ: nhập chữ) thì cũng set là 0
        if (isNaN(mileage)) {
            mileage = 0;
        }

        const dataToCreate = {
            brand: vehicleData.brand,
            model: vehicleData.model,
            color: vehicleData.color || null,
            year: parseInt(vehicleData.year, 10), // Đảm bảo year là số
            vin: vehicleData.vin,
            licensePlate: vehicleData.licensePlate || null, // Dùng null nếu không có
            currentMileage: mileage, // Sử dụng giá trị đã chuẩn hóa
            ownerId: vehicleData.ownerId,
        };
        // --- KẾT THÚC SỬA ĐỔI ---

        // 3. Gọi repository để tạo
        const newVehiclePrisma = await this.vehicleRepository.create(dataToCreate);

        // 4. Trả về entity Vehicle
        return new VehicleEntity(newVehiclePrisma);
    }
}

module.exports = AddVehicle;