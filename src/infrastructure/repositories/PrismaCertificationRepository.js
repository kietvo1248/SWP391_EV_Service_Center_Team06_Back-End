const ICertificationRepository = require('../../domain/repositories/ICertificationRepository');
class PrismaCertificationRepository extends ICertificationRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async findAll() {
        return this.prisma.certification.findMany();
    }
    async findById(id) {
        return this.prisma.certification.findUnique({ where: { id: id } });
    }
}
module.exports = PrismaCertificationRepository;