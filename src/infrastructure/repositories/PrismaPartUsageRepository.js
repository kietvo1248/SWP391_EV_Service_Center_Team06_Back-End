// Tệp: src/infrastructure/repositories/PrismaPartUsageRepository.js
const IPartUsageRepository = require('../../domain/repositories/IPartUsageRepository');
const { PartUsageStatus } = require('@prisma/client');

class PrismaPartUsageRepository extends IPartUsageRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async create(data, tx) {
        const db = tx || this.prisma;
        return db.partUsage.create({
            data: data,
        });
    }

    async findByServiceRecord(serviceRecordId, status = null) {
        const whereConditions = {
            serviceRecordId: serviceRecordId,
        };
        
        if (status) {
            whereConditions.status = status;
        }

        return this.prisma.partUsage.findMany({
            where: whereConditions,
            include: {
                part: true // Thường chúng ta sẽ cần thông tin phụ tùng
            }
        });
    }

    /**
     * Triển khai hàm updateStatusByRecordId (trước đây bị thiếu)
     */
    async updateStatusByRecordId(serviceRecordId, newStatus, oldStatus = null, tx) {
        const db = tx || this.prisma;

        const whereConditions = {
            serviceRecordId: serviceRecordId,
        };

        if (oldStatus) {
            // Chỉ cập nhật những bản ghi có trạng thái cũ là 'oldStatus'
            whereConditions.status = oldStatus;
        }

        return db.partUsage.updateMany({
            where: whereConditions,
            data: {
                status: newStatus,
            },
        });
    }
}
module.exports = PrismaPartUsageRepository;