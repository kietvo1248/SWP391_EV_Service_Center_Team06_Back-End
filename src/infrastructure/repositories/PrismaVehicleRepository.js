const IVehicleRepository = require('../../domain/repositories/IVehicleRepository');
// const prisma = new PrismaClient();
// const { PrismaClient } = require('@prisma/client');

class PrismaVehicleRepository extends IVehicleRepository {
    constructor(PrismaClient) {
        super();
        this.prisma = PrismaClient;
    }
    async create(vehicleData) {
        return await this.prisma.vehicle.create({
            data: vehicleData,
        });
    }

    async findByVin(vin) {
        return await this.prisma.vehicle.findUnique({
            where: { vin },
        }); 
    }

    async findByOwnerId(ownerId) {
        return await this.prisma.vehicle.findMany({
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