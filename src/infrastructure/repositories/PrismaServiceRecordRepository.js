// Tệp: src/infrastructure/repositories/PrismaServiceRecordRepository.js
const IServiceRecordRepository = require('../../domain/repositories/IServiceRecordRepository');

class PrismaServiceRecordRepository extends IServiceRecordRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async create(data, tx) {
        const db = tx || this.prisma; // Sử dụng transaction nếu được cung cấp
        return db.serviceRecord.create({
            data: data,
        });
    }
}

module.exports = PrismaServiceRecordRepository;