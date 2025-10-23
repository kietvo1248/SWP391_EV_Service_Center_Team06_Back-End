const IPaymentRepository = require('../../domain/repositories/IPaymentRepository');

class PrismaPaymentRepository extends IPaymentRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async create(data, tx) {
        const db = tx || this.prisma;
        return db.payment.create({ data });
    }
}
module.exports = PrismaPaymentRepository;