const IQuotationRepository = require('../../domain/repositories/IQuotationRepository');

class PrismaQuotationRepository extends IQuotationRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async create(data, tx) {
        const db = tx || this.prisma;
        return db.quotation.create({ data });
    }

    async findByServiceRecordId(serviceRecordId) {
        return this.prisma.quotation.findUnique({
            where: { serviceRecordId: serviceRecordId }
        });
    }
    async findById(id) {
        return this.prisma.quotation.findUnique({
            where: { id: id },
            // Lấy serviceRecord để kiểm tra quyền sở hữu (thuộc trung tâm nào)
            include: { 
                serviceRecord: {
                    include: {
                        appointment: {
                            select: { serviceCenterId: true, id: true, status: true }
                        }
                    }
                } 
            } 
        });
    }

    async update(id, data, tx) {
        const db = tx || this.prisma;
        return db.quotation.update({
            where: { id: id },
            data: data,
        });
    }
}
module.exports = PrismaQuotationRepository;