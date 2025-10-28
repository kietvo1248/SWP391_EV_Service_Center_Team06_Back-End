const VehicleEntity = require('../../domain/entities/Vehicle');

class AddVehicleForCustomer {
    constructor(vehicleRepository, userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    async execute(customerId, vehicleData, actor) {
        // 1. Kiểm tra actor có quyền không
        if (!['STAFF', 'STATION_ADMIN', 'ADMIN'].includes(actor.role)) {
            throw new Error('Forbidden: You do not have permission to add vehicles for customers.');
        }

        // 2. Kiểm tra khách hàng tồn tại
        const customer = await this.userRepository.findById(customerId);
        if (!customer || customer.role !== 'CUSTOMER') {
            throw new Error('Customer not found.');
        }
        
        // 3. Tái sử dụng logic từ use case AddVehicle (kiểm tra VIN)
        const existingVehicle = await this.vehicleRepository.findByVin(vehicleData.vin);
        if (existingVehicle) {
            throw new Error('Vehicle with this VIN already exists.');
        }

        // 4. Chuẩn bị dữ liệu (tái sử dụng logic chuẩn hóa từ AddVehicle)
        let mileage = vehicleData.currentMileage !== undefined && vehicleData.currentMileage !== null
                      ? parseInt(vehicleData.currentMileage, 10) : 0;
        if (isNaN(mileage)) { mileage = 0; }

        const dataToCreate = {
            make: vehicleData.make,
            model: vehicleData.model,
            year: parseInt(vehicleData.year, 10),
            vin: vehicleData.vin,
            licensePlate: vehicleData.licensePlate || null,
            currentMileage: mileage,
            ownerId: customerId, // Gán xe cho khách hàng
        };
        
        // 5. Tạo xe và trả về Entity
        const newVehiclePrisma = await this.vehicleRepository.create(dataToCreate);
        return new VehicleEntity(newVehiclePrisma);
    }
}
module.exports = AddVehicleForCustomer;