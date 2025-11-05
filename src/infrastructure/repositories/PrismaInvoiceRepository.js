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
    async findByServiceRecordId(serviceRecordId) {
        return this.prisma.invoice.findFirst({
            where: { serviceRecordId: serviceRecordId },
        });
    }

    async getRevenueByCenter(serviceCenterId, startDate, endDate) {
        const result = await this.prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            _count: { id: true },
            where: {
                status: 'PAID',
                serviceRecord: {
                    appointment: {
                        serviceCenterId: serviceCenterId,
                        // Lọc theo ngày hóa đơn được phát hành
                        issueDate: { 
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }
            }
        });
        return {
            totalRevenue: result._sum.totalAmount || 0,
            totalInvoices: result._count.id || 0,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }
}
module.exports = PrismaInvoiceRepository;