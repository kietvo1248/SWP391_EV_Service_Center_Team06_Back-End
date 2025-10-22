// const Vehicle = require ('../../domain/entities/Vehicle'); // No longer needed

class AddVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleData) {
        // Standardize the license plate key to prevent client-side typos
        const correctedVehicleData = { ...vehicleData };
        if (correctedVehicleData.licencePlate) {
            correctedVehicleData.licensePlate = correctedVehicleData.licencePlate;
            delete correctedVehicleData.licencePlate;
        }

        // Kiểm tra xem xe đã tồn tại chưa (theo VIN)
        const existingVehicle = await this.vehicleRepository.findByVin(correctedVehicleData.vin);
        if (existingVehicle) {
            throw new Error('Vehicle with this VIN already exists.');
        }   
        // Tạo xe mới
       const newVehicle = await this.vehicleRepository.create(correctedVehicleData);
        // 3. Trả về một plain object (DTO) thay vì một instance của class
        return newVehicle;
    }
}

module.exports = AddVehicle;