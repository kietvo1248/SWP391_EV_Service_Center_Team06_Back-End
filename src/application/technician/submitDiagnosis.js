// Tệp: src/application/technician/submitDiagnosis.js
const ServiceAppointmentEntity = require('../../domain/entities/ServiceAppointment'); 
const QuotationEntity = require('../../domain/entities/Quotation'); 
const { Decimal } = require('@prisma/client/runtime/library');
const { ServiceRecordStatus, AppointmentStatus, PartUsageStatus } = require('@prisma/client');

class SubmitDiagnosis {
    constructor(serviceRecordRepository, quotationRepository, appointmentRepository, prismaClient) {
        this.serviceRecordRepo = serviceRecordRepository;
        this.quotationRepo = quotationRepository;
        this.appointmentRepo = appointmentRepository;
        this.prisma = prismaClient;
    }

    // THAY ĐỔI: Thêm partUsages (danh sách { partId, quantity })
    async execute({ technicianId, serviceRecordId, estimatedCost, diagnosisNotes, partUsages = [] }) {
        let updatedApptPrisma;
        let createdQuotationPrisma;

        await this.prisma.$transaction(async (tx) => {
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record || record.technicianId !== technicianId) {
                throw new Error('Service record not found or not assigned to you.');
            }
            if (record.status !== ServiceRecordStatus.DIAGNOSING) {
                throw new Error('Service must be in DIAGNOSING state to submit diagnosis.');
            }

            // 1. Cập nhật ghi chú và trạng thái ServiceRecord
            await this.serviceRecordRepo.update(record.id, { 
                staffNotes: diagnosisNotes,
                status: ServiceRecordStatus.WAITING_APPROVAL // Chuyển sang chờ duyệt
            }, tx);

            // 2. Tạo PartUsage (với status REQUESTED)
            if (partUsages.length > 0) {
                const partIds = partUsages.map(p => p.partId);
                const parts = await tx.part.findMany({ where: { id: { in: partIds } } });
                if (parts.length !== partIds.length) {
                    throw new Error("One or more parts are invalid.");
                }

                const partUsageData = parts.map(part => {
                    const usage = partUsages.find(p => p.partId === part.id);
                    if (!usage || usage.quantity <= 0) {
                        throw new Error(`Invalid quantity for part ${part.name}`);
                    }
                    return {
                        serviceRecordId: record.id,
                        partId: part.id,
                        quantity: usage.quantity,
                        unitPrice: part.price,
                        status: PartUsageStatus.REQUESTED // Trạng thái chờ IM xuất kho
                    };
                });
                await tx.partUsage.createMany({ data: partUsageData });
            }
            // 3. Tạo Báo giá
            createdQuotationPrisma = await this.quotationRepo.create({
                serviceRecordId: record.id,
                estimatedCost: new Decimal(estimatedCost),
                creationDate: new Date(),
            }, tx);
            // 4. Cập nhật trạng thái Appointment -> PENDING_APPROVAL
            updatedApptPrisma = await this.appointmentRepo.updateStatus(record.appointmentId, AppointmentStatus.PENDING_APPROVAL, tx);
        });
        
        return { appointment: updatedApptPrisma, quotation: createdQuotationPrisma }; 
    }
}
module.exports = SubmitDiagnosis;