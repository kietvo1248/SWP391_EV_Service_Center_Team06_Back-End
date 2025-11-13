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
        return this.prisma.inventoryItem.findFirst({ 
            where: { 
                partId: partId, 
                serviceCenterId: serviceCenterId 
            } 
        });
    }
    async update(id, data, tx) {
        const db = tx || this.prisma;
        return db.inventoryItem.update({ where: { id: id }, data: data });
    }
    async findLowStock(serviceCenterId) {
        return this.prisma.inventoryItem.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                quantityInStock: {
                    lte: this.prisma.inventoryItem.fields.minStockLevel
                }
            },
            include: { part: true },
            orderBy: { part: { name: 'asc' } }
        });
    }
    async findBySku(sku, serviceCenterId) {
        return this.prisma.inventoryItem.findFirst({
            where: {
                serviceCenterId: serviceCenterId,
                part: {
                    sku: sku // Tìm kiếm lồng nhau qua model Part
                }
            },
            include: {
                part: true // Luôn kèm thông tin chi tiết phụ tùng
            }
        });
    }
}
module.exports = PrismaInventoryItemRepository;