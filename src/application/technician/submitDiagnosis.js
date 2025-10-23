// Tệp: src/application/technician/submitDiagnosis.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment'); 
const QuotationEntity = require('../../domain/entities/Quotation'); 
const { Decimal } = require('@prisma/client/runtime/library'); // Import Decimal

class SubmitDiagnosis {
    constructor(serviceRecordRepo, quotationRepo, appointmentRepo, prismaClient) {
        this.serviceRecordRepo = serviceRecordRepo;
        this.quotationRepo = quotationRepo;
        this.appointmentRepo = appointmentRepo;
        this.prisma = prismaClient;
    }

    async execute({ technicianId, serviceRecordId, estimatedCost, diagnosisNotes }) {
        if (!estimatedCost || estimatedCost <= 0) {
            throw new Error('Estimated cost is required.');
        }

        let updatedApptPrisma; // Lưu kết quả Prisma
        let createdQuotationPrisma;

        await this.prisma.$transaction(async (tx) => {
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record || record.technicianId !== technicianId) {
                throw new Error('Service record not found or not assigned to you.');
            }
            if (record.status !== 'IN_PROGRESS') {
                throw new Error('Service must be IN_PROGRESS to submit diagnosis.');
            }

            // 1. Cập nhật ghi chú vào ServiceRecord
            await this.serviceRecordRepo.update(record.id, { staffNotes: diagnosisNotes }, tx);

            // 2. Tạo Báo giá (Quotation)
            createdQuotationPrisma = await this.quotationRepo.create({
                serviceRecordId: record.id,
                estimatedCost: new Decimal(estimatedCost), // Đảm bảo lưu Decimal
                creationDate: new Date(),
            }, tx);

            // 3. Cập nhật trạng thái Appointment -> PENDING_APPROVAL
            updatedApptPrisma = await this.appointmentRepo.updateStatus(record.appointmentId, 'PENDING_APPROVAL', tx);
        });

        // 4. Chuyển đổi kết quả sang Entities
        const updatedApptEntity = new ServiceAppointmentEntity(
            updatedApptPrisma.id,
            updatedApptPrisma.customerId,
            updatedApptPrisma.vehicleId,
            updatedApptPrisma.serviceCenterId,
            updatedApptPrisma.appointmentDate,
            updatedApptPrisma.status,
            updatedApptPrisma.customerNotes,
            updatedApptPrisma.createdAt
        );

        const createdQuotationEntity = new QuotationEntity(
            createdQuotationPrisma.id,
            createdQuotationPrisma.serviceRecordId,
            createdQuotationPrisma.estimatedCost,
            createdQuotationPrisma.creationDate
        );

        // Trả về cả hai entity để controller có thể dùng
        return { appointment: updatedApptEntity, quotation: createdQuotationEntity };
    }
}
module.exports = SubmitDiagnosis;