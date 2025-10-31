
const IPartUsageRepository = require('../../domain/repositories/IPartUsageRepository');
class PrismaPartUsageRepository extends IPartUsageRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async findByServiceRecord(serviceRecordId, status) {
        const whereClause = { serviceRecordId: serviceRecordId };
        if (status) { whereClause.status = status; }
        return this.prisma.partUsage.findMany({ where: whereClause, include: { part: true } });
    }
    async updateStatus(ids, status, tx) {
        const db = tx || this.prisma;
        return db.partUsage.updateMany({ where: { id: { in: ids } }, data: { status: status } });
    }
}
module.exports = PrismaPartUsageRepository;