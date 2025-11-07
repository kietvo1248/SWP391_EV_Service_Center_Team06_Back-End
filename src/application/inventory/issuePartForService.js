// Tệp: src/application/inventory/issuePartsForService.js
const { ServiceRecordStatus, PartUsageStatus, Role } = require('@prisma/client');

class IssuePartsForService {
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

        // Bọc trong transaction để đảm bảo tất cả cập nhật thành công hoặc thất bại
        return this.prisma.$transaction(async (tx) => {
            
            // Bước 1: Lấy thông tin phiếu sửa chữa VÀ các phụ tùng đang yêu cầu
            const record = await tx.serviceRecord.findUnique({
                where: { id: serviceRecordId },
                include: {
                    partsUsed: {
                        where: { status: PartUsageStatus.REQUESTED },
                        include: { part: true } // Lấy tên phụ tùng để báo lỗi (nếu cần)
                    },
                    appointment: { // Lấy serviceCenterId từ lịch hẹn
                        select: { serviceCenterId: true }
                    }
                }
            });

            // Bước 2: Kiểm tra nghiệp vụ
            if (!record) throw new Error('Service record not found.');
            if (record.appointment.serviceCenterId !== actor.serviceCenterId) {
                throw new Error("Forbidden: This record is not in your service center.");
            }
            if (record.status !== ServiceRecordStatus.WAITING_PARTS) {
                throw new Error("Service record is not awaiting parts.");
            }

            const partsToIssue = record.partsUsed;
            if(partsToIssue.length === 0) throw new Error("No parts are currently requested for this service.");

            // --- SỬA LỖI RACE CONDITION: CẬP NHẬT NGUYÊN TỬ ---
            
            // Bước 3: Lặp qua các phụ tùng và trừ kho
            for (const part of partsToIssue) {
                
                // Đây là lệnh Cập nhật Nguyên tử (Atomic Update)
                // Nó thay thế 3 bước: ĐỌC, KIỂM TRA, GHI
                const updateResult = await tx.inventoryItem.updateMany({
                    where: {
                        partId: part.partId,
                        serviceCenterId: actor.serviceCenterId,
                        quantityInStock: { gte: part.quantity } // KIỂM TRA: Chỉ update nếu đủ hàng
                    },
                    data: {
                        quantityInStock: {
                            decrement: part.quantity // GHI: Trừ trực tiếp
                        }
                    }
                });

                // Nếu count = 0, nghĩa là điều kiện WHERE (đủ hàng) thất bại
                if (updateResult.count === 0) {
                    throw new Error(`Out of stock for ${part.part.name}. Required: ${part.quantity}. Transaction rolled back.`);
                }
            }
            // Bước 4: Nếu tất cả các lần trừ kho đều thành công,
            // cập nhật trạng thái PartUsage thành ISSUED
            const partUsageIds = partsToIssue.map(p => p.id);
            await tx.partUsage.updateMany({
                where: { id: { in: partUsageIds } },
                data: { status: PartUsageStatus.ISSUED }
            });

            // Bước 5: Cập nhật phiếu sửa chữa về REPAIRING
            const updatedRecord = await tx.serviceRecord.update({
                where: { id: serviceRecordId },
                data: {
                    status: ServiceRecordStatus.REPAIRING // Trả về cho KTV làm tiếp
                }
            });
            
            return updatedRecord;
        });
    }
}
module.exports = IssuePartsForService;