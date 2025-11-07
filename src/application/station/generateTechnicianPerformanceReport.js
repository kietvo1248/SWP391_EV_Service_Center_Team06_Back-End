// Tệp: src/application/station/generateTechnicianPerformanceReport.js
// ... (Tương tự như GenerateStationRevenueReport, lọc theo centerId của SA) ...
const { Role } = require('@prisma/client');
class GenerateTechnicianPerformanceReport {
    constructor(serviceRecordRepository) {
        this.serviceRecordRepo = serviceRecordRepository;
    }
    async execute(actor, { startDate, endDate }) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        if (!actor.serviceCenterId) throw new Error("Actor is not assigned to a center.");

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Invalid date range.");
        end.setHours(23, 59, 59, 999);

        return this.serviceRecordRepo.getPerformanceByCenter(actor.serviceCenterId, start, end);
    }
}
module.exports = GenerateTechnicianPerformanceReport;