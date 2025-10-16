const { PrismaClient } = require('@prisma/client');
const IVehicleRepository = require('../../domain/repositories/IVehicleRepository');
const prisma = new PrismaClient();

class PrismaVehicleRepository extends IVehicleRepository {
    async create(vehicleData) {
        return await prisma.vehicle.create({
            data: vehicleData,
        });
    }

    async findByVin(vin) {
        return await prisma.vehicle.findUnique({
            where: { vin },
        }); 
    }

    async findByOwnerId(ownerId) {
        return await prisma.vehicle.findMany({
            where: { ownerId },
        });
    }       
}

module.exports = PrismaVehicleRepository;