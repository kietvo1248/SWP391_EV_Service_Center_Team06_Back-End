// tạo report
const { Role } = require('@prisma/client');
class GenerateStationRevenueReport {
    constructor(invoiceRepository) {
        this.invoiceRepo = invoiceRepository;
    }
    async execute(actor, { startDate, endDate }) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        if (actor.role === Role.STATION_ADMIN && !actor.serviceCenterId) {
            throw new Error("Station Admin is not assigned to a center.");
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date range.");
        }
        end.setHours(23, 59, 59, 999);

        // Admin tổng xem tất cả trạm (truyền null), SA chỉ xem trạm của mình
        const centerId = actor.role === 'ADMIN' ? null : actor.serviceCenterId;

        // Cần cập nhật IInvoiceRepository.getRevenueByCenter để chấp nhận centerId = null
        return this.invoiceRepo.getRevenueByCenter(centerId, start, end);
    }
}
module.exports = GenerateStationRevenueReport;