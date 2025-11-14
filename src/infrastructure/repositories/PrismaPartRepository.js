// Tệp: src/infrastructure/repositories/PrismaPartRepository.js
const IPartRepository = require('../../domain/repositories/IPartRepository');
const { Prisma } = require('@prisma/client'); // (THÊM DÒNG NÀY ĐỂ SỬA LỖI)

class PrismaPartRepository extends IPartRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    
    async findById(id) {
        return this.prisma.part.findUnique({ where: { id: id } });
    }
    
    async findByIds(ids) {
        return this.prisma.part.findMany({ where: { id: { in: ids } } });
    }

    async findBySku(sku, tx) {
        const db = tx || this.prisma;
        return db.part.findUnique({
            where: { sku: sku }
        });
    }

    async create(partData, tx) {
        const db = tx || this.prisma;
        const { sku, name, description, price } = partData;

        return db.part.create({
            data: {
                sku,
                name,
                description,
                price: new Prisma.Decimal(price) // Giờ 'Prisma' đã được định nghĩa
            }
        });
    }
    
    async update(id, partData, tx) {
        const db = tx || this.prisma;
        const { sku, name, description, price } = partData;
        return db.part.update({
            where: { id: id },
            data: {
                sku,
                name,
                description,
                price: new Prisma.Decimal(price) // Giờ 'Prisma' đã được định nghĩa
            }
        });
    }
}
module.exports = PrismaPartRepository;