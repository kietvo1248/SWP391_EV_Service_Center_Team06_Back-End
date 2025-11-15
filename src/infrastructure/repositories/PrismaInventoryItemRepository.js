const IInventoryItemRepository = require('../../domain/repositories/IInventoryItemRepository');

class PrismaInventoryItemRepository extends IInventoryItemRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async findByCenter(serviceCenterId) {
        return this.prisma.inventoryItem.findMany({
            where: { serviceCenterId: serviceCenterId, isDeleted: false},
            include: { part: true }, orderBy: { part: { name: 'asc' } }
        });
    }
    async findById(id) {
        return this.prisma.inventoryItem.findFirst({ 
            where: { 
                id: id,
                isDeleted: false 
            },
            include: { part: true } // Kèm thông tin chi tiết phụ tùng
        });
    }
    async findByPartAndCenter(partId, serviceCenterId) {
        return this.prisma.inventoryItem.findFirst({ 
            where: { 
                partId: partId, 
                serviceCenterId: serviceCenterId,
                isDeleted: false
            } 
        });
    }
    async update(id, data, tx) {
        const db = tx || this.prisma;
        return db.inventoryItem.update({ where: { id: id }, data: data });
    }
    
    async findBySku(sku, serviceCenterId) {
        return this.prisma.inventoryItem.findMany({ 
            where: {
                serviceCenterId: serviceCenterId,
                part: {
                    // (SỬA) Thêm 'contains' và 'mode' (để không phân biệt hoa/thường)
                    sku: {
                        contains: sku,
                        mode: 'insensitive' 
                    }
                },
                isDeleted: false
            },
            include: {
                part: true 
            }
        });
    }

    async findLowStock(serviceCenterId) {
        // Prisma không hỗ trợ so sánh trực tiếp 2 cột (quantity <= minStock) trong where đơn giản.
        // Ta dùng findMany rồi lọc, hoặc dùng rawQuery. 
        // Để an toàn và đơn giản, ta lấy hết về rồi lọc (với quy mô trạm dịch vụ thì OK).
        const allItems = await this.prisma.inventoryItem.findMany({
            where: { 
                serviceCenterId: serviceCenterId,
                isDeleted: false
            },
            include: { part: true }
        });

        return allItems.filter(item => item.quantityInStock <= item.minStockLevel);
    }

    async create(data) {
        return this.prisma.inventoryItem.create({ data });
    }

    // Xóa mềm
    async softDelete(id) {
        return this.prisma.inventoryItem.update({
            where: { id: id },
            data: { isDeleted: true }
        });
    }
}
module.exports = PrismaInventoryItemRepository;