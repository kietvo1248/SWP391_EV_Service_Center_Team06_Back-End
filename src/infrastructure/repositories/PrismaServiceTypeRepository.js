const IServiceTypeRepository = require('../../domain/repositories/IServiceTypeRepository');

class PrismaServiceTypeRepository extends IServiceTypeRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async findAll() {
        return this.prisma.serviceType.findMany({
            select: {
                id: true,
                name: true,
                description: true
            }
        });
    }
    async findById(id) {
        return this.prisma.serviceType.findUnique({
            where: { id: id },
        });
    }

    async getAllServiceTypes() {
        return this.prisma.serviceType.findMany({
            select: {
                id: true,
                name: true,
                description: true
            }
        });
    }
    async createServiceType(serviceTypeData) {
        throw new Error('Method not implemented');
    }
    async updateServiceType(id, updateData) {
        throw new Error('Method not implemented');
    }
    async deleteServiceType(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = PrismaServiceTypeRepository;