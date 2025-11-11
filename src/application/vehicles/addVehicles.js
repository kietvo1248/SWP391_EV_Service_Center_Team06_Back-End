// Tệp: src/application/vehicles/addVehicles.js
const { Prisma } = require('@prisma/client'); // Import Prisma để bắt lỗi

class AddVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    async execute(ownerId, vehicleData) {
        const { vin, year, vehicleModelId, batteryId, licensePlate, color } = vehicleData;

        // 1. Validation dữ liệu đầu vào (Giữ nguyên)
        if (!vin || !year || !vehicleModelId || !batteryId) {
            throw new Error('VIN, year, model, and battery are required.');
        }

        // gi1ấu để tránh race condition
        // //2. Kiểm tra VIN trùng lặp (Giữ logic từ file gốc )
        // const existingVin = await this.vehicleRepository.findByVin(vin);
        // if (existingVin) {
        //     throw new Error('Vehicle with this VIN already exists.');
        // }

        // // 3. Kiểm tra Biển số trùng lặp (Giữ logic từ file gốc )
        // if (licensePlate) {
        //     const existingPlate = await this.vehicleRepository.findByLicensePlate(licensePlate);
        //     if (existingPlate) {
        //         throw new Error('Vehicle with this License Plate already exists.');
        //     }
        // }

        // 3. (MỚI) Kiểm tra tính tương thích của Pin (Logic này vẫn đúng)
        const compatibleBatteries = await this.vehicleRepository.listCompatibleBatteries(vehicleModelId);
        const isCompatible = compatibleBatteries.some(battery => battery.id === batteryId);
        if (!isCompatible) {
            throw new Error('Selected battery is not compatible with this vehicle model.');
        }

        // 4. Chuẩn bị dữ liệu
        const dataToCreate = {
            ownerId: ownerId,
            vin: vin,
            year: parseInt(year, 10),
            vehicleModelId: vehicleModelId,
            batteryId: batteryId,
            licensePlate: licensePlate,
            color: color || null,
            currentMileage: parseInt(currentMileage, 10) || 0,
            isDeleted: false
        };

        return await this.vehicleRepository.create(dataToCreate);

    } catch(error) {
        // 5. Xử lý tập trung các lỗi

        // Bẫy lỗi CSDL P2002 (Trùng lặp)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            if (error.meta && error.meta.target.includes('vin')) {
                throw new Error('Vehicle with this VIN already exists.');
            }
            if (error.meta && error.meta.target.includes('licensePlate')) {
                throw new Error('Vehicle with this License Plate already exists.');
            }
            throw new Error('A unique constraint was violated.');
        }

        throw error;
    }
}

module.exports = AddVehicle;