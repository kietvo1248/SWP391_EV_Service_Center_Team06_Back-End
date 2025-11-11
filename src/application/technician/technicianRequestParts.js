// Tệp: src/application/technician/technicianRequestParts.js
const { Prisma, ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');

class TechnicianRequestParts {
    constructor(serviceRecordRepository, partRepository, partUsageRepository, prismaClient) {
        this.serviceRecordRepo = serviceRecordRepository;
        this.partRepo = partRepository;
        this.partUsageRepo = partUsageRepository;
        this.prisma = prismaClient;
    }

    async execute(serviceRecordId, actor, partItems) {
        if (!partItems || partItems.length === 0) {
            throw new Error("Part items list cannot be empty.");
        }

        // Bọc trong transaction
        return this.prisma.$transaction(async (tx) => {
            // 1. Kiểm tra Service Record
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record) {
                throw new Error("Service record not found.");
            }
            if (record.technicianId !== actor.id) {
                throw new Error("Forbidden: You are not assigned to this service record.");
            }
            // Chỉ cho phép yêu cầu thêm khi đang sửa chữa
            if (record.status !== ServiceRecordStatus.REPAIRING) {
                throw new Error("Parts can only be requested during REPAIRING status.");
            }

            // 2. Lấy thông tin giá của các phụ tùng được yêu cầu
            const partIds = partItems.map(p => p.partId);
            const partsFromDb = await tx.part.findMany({
                where: { id: { in: partIds } }
            });

            const partUsageData = [];
            for (const item of partItems) {
                const partInfo = partsFromDb.find(p => p.id === item.partId);
                if (!partInfo) {
                    throw new Error(`Invalid Part ID: ${item.partId}`);
                }
                
                partUsageData.push({
                    serviceRecordId: serviceRecordId,
                    partId: item.partId,
                    quantity: item.quantity,
                    unitPrice: partInfo.price, // Lưu lại giá tại thời điểm yêu cầu
                    status: PartUsageStatus.REQUESTED // Trạng thái chờ kho duyệt
                });
            }

            // 3. Tạo các bản ghi PartUsage mới
            await tx.partUsage.createMany({
                data: partUsageData
            });

            // 4. Cập nhật trạng thái Service Record -> WAITING_PARTS
            // (Để Quản lý kho thấy yêu cầu này)
            const updatedRecord = await this.serviceRecordRepo.update(serviceRecordId, {
                status: ServiceRecordStatus.WAITING_PARTS
            }, tx);
            
            // (Lưu ý: Luồng này có thể cần báo giá lại, nhưng hiện tại chúng ta chỉ xử lý yêu cầu phụ tùng)
            
            return updatedRecord;
        });
    }
}

module.exports = TechnicianRequestParts;