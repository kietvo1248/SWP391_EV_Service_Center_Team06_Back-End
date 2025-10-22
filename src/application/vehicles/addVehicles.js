const Vehicle = require ('../../domain/entities/Vehicle');

class AddVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleData) {
        // Kiểm tra xem xe đã tồn tại chưa (theo VIN)
        const existingVehicle = await this.vehicleRepository.findByVin(vehicleData.vin);
        if (existingVehicle) {
            throw new Error('Vehicle with this VIN already exists.');
        }   
        // Tạo xe mới
       const newVehicle = await this.vehicleRepository.create({
            make,
            model,
            year,
            vin,
            licensePlate,
            ownerId,
        });
        // 3. Trả về entity Vehicle
        return new Vehicle(
            newVehicle.id,
            newVehicle.make,
            newVehicle.model,
            newVehicle.year,
            newVehicle.vin,
            newVehicle.licensePlate,
            newVehicle.ownerId
        );
    }
}

module.exports = AddVehicle;