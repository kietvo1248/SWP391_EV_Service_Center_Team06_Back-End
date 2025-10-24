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
}
module.exports = PrismaQuotationRepository;