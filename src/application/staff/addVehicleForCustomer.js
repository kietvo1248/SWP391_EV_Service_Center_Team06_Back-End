// Tệp: src/application/staff/addVehicleForCustomer.js
const VehicleEntity = require('../../domain/entities/Vehicle');
const { Prisma } = require('@prisma/client'); // Import Prisma

class AddVehicleForCustomer {
    constructor(vehicleRepository, userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    async execute(customerId, vehicleData, actor) {
        // 1. Kiểm tra quyền (Giữ nguyên)
        if (!['STAFF', 'STATION_ADMIN', 'ADMIN'].includes(actor.role)) {
            throw new Error('Forbidden: You do not have permission to add vehicles for customers.');
        }

        // 2. Kiểm tra khách hàng (Giữ nguyên)
        const customer = await this.userRepository.findById(customerId);
        if (!customer || customer.role !== 'CUSTOMER') {
            throw new Error('Customer not found.');
        }
        
        const { vin, year, vehicleModelId, batteryId, licensePlate, color, currentMileage } = vehicleData;

        const compatibleBatteries = await this.vehicleRepository.listCompatibleBatteries(vehicleModelId);
        const isCompatible = compatibleBatteries.some(battery => battery.id === batteryId);
        if (!isCompatible) {
            throw new Error('Selected battery is not compatible with this vehicle model.');
        }

        // 4. Chuẩn bị dữ liệu (dùng schema mới)
        const dataToCreate = {
            vehicleModelId: vehicleModelId,
            batteryId: batteryId,
            year: parseInt(vehicleData.year, 10),
            vin: vehicleData.vin,
            licensePlate: vehicleData.licensePlate || null,
            color: vehicleData.color || null,
            currentMileage: parseInt(currentMileage, 10) || 0,
            ownerId: customerId, // Gán xe cho khách hàng
        };
        
        // 5. Tạo xe và trả về Entity
        try {
            const newVehiclePrisma = await this.vehicleRepository.create(dataToCreate);
            // Logic này sẽ hoạt động sau khi VehicleEntity (Bước 1) được sửa
            return new VehicleEntity(newVehiclePrisma);
        } catch (error) {
            // (Xử lý lỗi TOCTOU)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                if (error.meta && error.meta.target.includes('vin')) {
                    throw new Error('Vehicle with this VIN already exists.');
                }
                if (error.meta && error.meta.target.includes('licensePlate')) {
                    throw new Error('Vehicle with this License Plate already exists.');
                }
            }
            throw error;
        }
    }
}
module.exports = AddVehicleForCustomer;