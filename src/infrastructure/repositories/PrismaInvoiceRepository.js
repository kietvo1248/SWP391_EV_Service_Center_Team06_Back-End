const IInvoiceRepository = require('../../domain/repositories/IInvoiceRepository');

class PrismaInvoiceRepository extends IInvoiceRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async create(data, tx) {
        const db = tx || this.prisma;
        return db.invoice.create({ data });
    }

    async updateStatus(id, status, tx) {
        const db = tx || this.prisma;
        return db.invoice.update({
            where: { id: id },
            data: { status: status },
        });
    }
}
module.exports = PrismaInvoiceRepository;