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
        
        // 1. Tạo điều kiện lọc WHERE cơ bản cho Prisma (cho truy vấn Aggregate)
        const whereConditions = {
            status: InvoiceStatus.PAID,
            issueDate: {
                gte: startDate,
                lte: endDate
            }
        };
        
        // Nếu là SA (có serviceCenterId), thêm bộ lọc trạm
        if (serviceCenterId) {
            whereConditions.serviceRecord = {
                appointment: {
                    serviceCenterId: serviceCenterId
                }
            };
        }

        // 2. Xây dựng truy vấn Raw Query cho GroupBy
        // (Vì Prisma groupBy() không hỗ trợ group theo 'ngày' của 'DateTime' một cách trực tiếp)
        
        // Mảng chứa các tham số (an toàn, chống SQL Injection)
        const queryParams = [startDate, endDate];
        
        // Bắt đầu câu query
        let dailyQuery = `
            SELECT 
                DATE_TRUNC('day', inv."issue_date")::date as date, 
                SUM(inv."total_amount") as revenue
            FROM "invoices" AS inv
        `;
        
        // Thêm JOINs nếu cần lọc theo trạm
        if (serviceCenterId) {
            dailyQuery += `
                INNER JOIN "service_records" AS sr ON inv."serviceRecordId" = sr.id
                INNER JOIN "service_appointments" AS sa ON sr."appointmentId" = sa.id
            `;
        }

        // Thêm WHERE
        let whereClauseRaw = `
            WHERE 
                inv."status" = 'PAID' AND
                inv."issue_date" BETWEEN $1 AND $2
        `;
        
        if (serviceCenterId) {
            whereClauseRaw += ` AND sa."serviceCenterId" = $3`;
            queryParams.push(serviceCenterId);
        }

        // Hoàn thành câu query
        dailyQuery += whereClauseRaw;
        dailyQuery += `
            GROUP BY DATE_TRUNC('day', inv."issue_date")
            ORDER BY date ASC;
        `;


        // 3. Thực hiện 2 truy vấn song song trong 1 transaction
        const [aggregateResult, dailyData] = await this.prisma.$transaction([
            
            // Query 1: Lấy tổng (Dùng Prisma thuần túy)
            this.prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                _count: { id: true },
                where: whereConditions
            }),

            // Query 2: Group by ngày (Dùng Raw Query đã xây dựng)
            this.prisma.$queryRawUnsafe(dailyQuery, ...queryParams)
        ]);

        // 4. Xử lý kết quả Raw Query
        const formattedDailyData = dailyData.map(d => ({
            date: d.date.toISOString().split('T')[0], // Format lại YYYY-MM-DD
            revenue: Number(d.revenue) // Convert Decimal (String) về Number
        }));

        // 5. Trả về kết quả tổng hợp
        return {
            totalRevenue: aggregateResult._sum.totalAmount || 0,
            totalInvoices: aggregateResult._count.id || 0,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            data: formattedDailyData // <--- Đã thêm mảng data array
        };
    }
}
module.exports = PrismaInvoiceRepository;