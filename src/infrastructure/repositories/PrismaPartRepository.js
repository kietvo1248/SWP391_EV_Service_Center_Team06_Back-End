// Tệp: src/infrastructure/repositories/PrismaPartRepository.js
const IPartRepository = require('../../domain/repositories/IPartRepository');
class PrismaPartRepository extends IPartRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async findById(id) {
        return this.prisma.part.findUnique({ where: { id: id } });
    }
    async findByIds(ids) {
        return this.prisma.part.findMany({ where: { id: { in: ids } } });
    }
}
module.exports = PrismaPartRepository;