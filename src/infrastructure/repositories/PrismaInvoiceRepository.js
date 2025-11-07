const IInvoiceRepository = require('../../domain/repositories/IInvoiceRepository');
const { Prisma, InvoiceStatus } = require('@prisma/client'); // Import Status

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
        
        // 1. (Sửa lỗi 2) Tạo điều kiện where cơ bản.
        // issueDate nằm ở cấp Invoice, không phải Appointment.
        const whereConditions = {
            status: InvoiceStatus.PAID, // An toàn hơn khi dùng Enum
            issueDate: { // Lọc ngày tháng phải ở đây
                gte: startDate,
                lte: endDate
            }
        };

        // 2. (Sửa lỗi 1) Chỉ thêm bộ lọc trạm nếu serviceCenterId tồn tại (không phải null)
        if (serviceCenterId) {
            whereConditions.serviceRecord = {
                appointment: {
                    serviceCenterId: serviceCenterId
                }
            };
        }

        const result = await this.prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            _count: { id: true },
            where: whereConditions // Sử dụng điều kiện động
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