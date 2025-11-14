const IRestockRequestRepository = require('../../domain/repositories/IRestockRequestRepository');
const { RestockRequestStatus } = require('@prisma/client');

class PrismaRestockRequestRepository extends IRestockRequestRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }

    async create(data) { 
        return this.prisma.restockRequest.create({ 
            data: data,
            include: {
                part: true, // Lấy thông tin phụ tùng
                inventoryManager: {
                    select: { fullName: true, employeeCode: true }
                }
            }
        }); 
    }

    async findByCenter(serviceCenterId, status) {
        const whereClause = { serviceCenterId: serviceCenterId };
        if (status) { whereClause.status = status; }
        
        return this.prisma.restockRequest.findMany({
            where: whereClause,
            include: { 
                part: true, 
                inventoryManager: { select: { fullName: true, employeeCode: true } },
                admin: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id) {
        return this.prisma.restockRequest.findUnique({ 
            where: { id: id }, 
            include: { part: true } 
        });
    }

    async update(id, data, tx) {
        const db = tx || this.prisma;
        return db.restockRequest.update({ where: { id: id }, data: data });
    }
    async findActiveByPartAndCenter(partId, serviceCenterId) {
        return this.prisma.restockRequest.findFirst({
            where: {
                partId: partId,
                serviceCenterId: serviceCenterId,
                status: {
                    in: [RestockRequestStatus.PENDING, RestockRequestStatus.APPROVED] 
                }
            }
        });
    }
}
module.exports = PrismaRestockRequestRepository;