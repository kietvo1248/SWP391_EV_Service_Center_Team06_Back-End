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
    async add(vehicle, ownerId) {
        return this.prisma.vehicle.create({
            data: {
                ...vehicle,
                ownerId: ownerId,
            },
        });
    }
    async findByIdAndOwner(vehicleId, ownerId) {
        return this.prisma.vehicle.findFirst({
            where: {
                id: vehicleId,
                ownerId: ownerId,
            }
        });
    } 
}

module.exports = PrismaVehicleRepository;