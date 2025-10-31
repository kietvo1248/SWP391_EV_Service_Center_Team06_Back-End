const IInventoryItemRepository = require('../../domain/repositories/IInventoryItemRepository');

class PrismaInventoryItemRepository extends IInventoryItemRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async findByCenter(serviceCenterId) {
        return this.prisma.inventoryItem.findMany({
            where: { serviceCenterId: serviceCenterId },
            include: { part: true }, orderBy: { part: { name: 'asc' } }
        });
    }
    async findById(id) {
        return this.prisma.inventoryItem.findUnique({ where: { id: id } });
    }
    async findByPartAndCenter(partId, serviceCenterId) {
        return this.prisma.inventoryItem.findFirst({ where: { partId: partId, serviceCenterId: serviceCenterId } });
    }
    async update(id, data, tx) {
        const db = tx || this.prisma;
        return db.inventoryItem.update({ where: { id: id }, data: data });
    }
}
module.exports = PrismaInventoryItemRepository;