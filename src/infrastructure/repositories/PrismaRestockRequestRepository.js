// Tệp: src/infrastructure/repositories/PrismaRestockRequestRepository.js
const IRestockRequestRepository = require('../../domain/repositories/IRestockRequestRepository');
class PrismaRestockRequestRepository extends IRestockRequestRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async create(data) { return this.prisma.restockRequest.create({ data }); }
    async findByCenter(serviceCenterId, status) {
        const whereClause = { serviceCenterId: serviceCenterId };
        if (status) { whereClause.status = status; }
        return this.prisma.restockRequest.findMany({
            where: whereClause,
            include: { part: true, inventoryManager: { select: { fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.restockRequest.findUnique({ where: { id: id }, include: { part: true } });
    }
    async update(id, data, tx) {
        const db = tx || this.prisma;
        return db.restockRequest.update({ where: { id: id }, data: data });
    }
}
module.exports = PrismaRestockRequestRepository;