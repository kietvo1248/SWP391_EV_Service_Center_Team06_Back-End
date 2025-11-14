const ICertificationRepository = require('../../domain/repositories/ICertificationRepository');
class PrismaCertificationRepository extends ICertificationRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    async findAll() {
        return this.prisma.certification.findMany();
    }
    async findById(id) {
        return this.prisma.certification.findUnique({ where: { id: id } });
    }
    async create(data) {
        return this.prisma.certification.create({ data });
    }
    async update(id, data) {
        return this.prisma.certification.update({
            where: { id: id },
            data: data
        });
    }
    async delete(id) {
        // Cần try...catch ở Use Case vì nếu chứng chỉ đang được gán (onDelete: Restrict)
        // CSDL sẽ báo lỗi
        return this.prisma.certification.delete({
            where: { id: id }
        });
    }
}
module.exports = PrismaCertificationRepository;