// Tệp: src/application/technician/technicianRequestParts.js
const { ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

class TechnicianRequestParts {
    // Inject prismaClient ở đây là BẮT BUỘC để đảm bảo transaction
    constructor(serviceRecordRepository, partRepository, partUsageRepository, prismaClient) {
        this.serviceRecordRepo = serviceRecordRepository;
        this.partRepo = partRepository;
        this.partUsageRepo = partUsageRepository;
        this.prisma = prismaClient;
    }

    async execute(serviceRecordId, partItems, actor) {
        // partItems = [{ partId: "uuid", quantity: 2 }, ...]

        if (!partItems || partItems.length === 0) {
            throw new Error("Part items list cannot be empty.");
        }
        
        return this.prisma.$transaction(async (tx) => {
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record || record.technicianId !== actor.id) {
                throw new Error('Service record not found or not assigned to you.');
            }
            if (record.status !== ServiceRecordStatus.REPAIRING) {
                throw new Error('Can only request parts when service is in REPAIRING state (after customer approval).');
            }

            const partIds = partItems.map(p => p.partId);
            const parts = await this.partRepo.findByIds(partIds);
            if (parts.length !== partIds.length) {
                throw new Error("One or more parts are invalid.");
            }

            const partUsageData = parts.map(part => {
                const item = partItems.find(p => p.partId === part.id);
                return {
                    serviceRecordId: record.id,
                    partId: part.id,
                    quantity: item.quantity,
                    unitPrice: part.price,
                    status: PartUsageStatus.REQUESTED
                };
            });

            // 1. Tạo PartUsage
            await this.partUsageRepo.createMany(partUsageData, tx);
            
            // 2. Cập nhật ServiceRecord -> WAITING_PARTS
            const updatedRecord = await this.serviceRecordRepo.update(recordId, {
                status: ServiceRecordStatus.WAITING_PARTS
            }, tx);
            
            return updatedRecord;
        });
    }
}
module.exports = TechnicianRequestParts;