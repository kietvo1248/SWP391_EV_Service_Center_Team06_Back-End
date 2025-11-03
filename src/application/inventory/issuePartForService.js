// Tệp: src/application/inventory/issuePartsForService.js
const { ServiceRecordStatus, PartUsageStatus, Role } = require('@prisma/client');

class IssuePartsForService {
    // Cần prismaClient cho transaction
    constructor(serviceRecordRepository, inventoryItemRepository, partUsageRepository, prismaClient) {
        this.serviceRecordRepo = serviceRecordRepository;
        this.inventoryItemRepo = inventoryItemRepository;
        this.partUsageRepo = partUsageRepository;
        this.prisma = prismaClient;
    }

    async execute(serviceRecordId, actor) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden: Access denied.");
        }

        return this.prisma.$transaction(async (tx) => {
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record) throw new Error('Service record not found.');
            
            // Cần sửa serviceRecordRepo.findById để include appointment.serviceCenterId
            // Tạm thời giả định record.appointment.serviceCenterId tồn tại
            // if (record.appointment.serviceCenterId !== actor.serviceCenterId) {
            //     throw new Error("Forbidden. Record is not in your center.");
            // }
            if (record.status !== ServiceRecordStatus.WAITING_PARTS) {
                throw new Error("Service record is not awaiting parts.");
            }

            const partsToIssue = await this.partUsageRepo.findByServiceRecord(serviceRecordId, PartUsageStatus.REQUESTED);
            if(partsToIssue.length === 0) throw new Error("No parts are currently requested for this service.");

            for (const part of partsToIssue) {
                const inventoryItem = await this.inventoryItemRepo.findByPartAndCenter(part.partId, actor.serviceCenterId);
                if (!inventoryItem || inventoryItem.quantityInStock < part.quantity) {
                    throw new Error(`Not enough stock for ${part.part.name}. Required: ${part.quantity}, Available: ${inventoryItem?.quantityInStock || 0}`);
                }
                
                await this.inventoryItemRepo.update(inventoryItem.id, {
                    quantityInStock: inventoryItem.quantityInStock - part.quantity
                }, tx);
            }
            
            await this.partUsageRepo.updateStatusByIds(partsToIssue.map(p => p.id), PartUsageStatus.ISSUED, tx);
            const updatedRecord = await this.serviceRecordRepo.update(serviceRecordId, {
                status: ServiceRecordStatus.REPAIRING // Trả về cho KTV làm tiếp
            }, tx);
            
            return updatedRecord;
        });
    }
}
module.exports = IssuePartsForService;