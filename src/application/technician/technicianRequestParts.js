// Tệp: src/application/technician/technicianRequestParts.js
const { Prisma, ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');

class TechnicianRequestParts {
    constructor(
        serviceRecordRepository, 
        partRepository, 
        partUsageRepository, 
        inventoryItemRepository,
        prismaClient
    ) {
        this.serviceRecordRepo = serviceRecordRepository;
        this.partRepo = partRepository;
        this.partUsageRepo = partUsageRepository;
        this.inventoryItemRepo = inventoryItemRepository; 
        this.prisma = prismaClient;
    }

    async execute(serviceRecordId, actor, partItems) {
        if (!partItems || partItems.length === 0) {
            throw new Error("Part items list cannot be empty.");
        }

        // Bọc trong transaction để đảm bảo tính toàn vẹn
        return this.prisma.$transaction(async (tx) => {
            
            // 1. Kiểm tra Service Record (và quyền của KTV)
            const record = await this.serviceRecordRepo.findById(serviceRecordId);
            if (!record) {
                throw new Error("Service record not found.");
            }
            if (record.technicianId !== actor.id) {
                throw new Error("Forbidden: You are not assigned to this service record.");
            }
            // (SỬA) Chỉ cho phép yêu cầu khi đang IN_PROGRESS
            if (record.status !== ServiceRecordStatus.IN_PROGRESS) {
                throw new Error("Parts can only be requested during IN_PROGRESS status.");
            }
            
            // Lấy serviceCenterId từ actor (an toàn hơn)
            const serviceCenterId = actor.serviceCenterId;
            if (!serviceCenterId) {
                throw new Error("Actor is not associated with a service center.");
            }

            // 2. Lấy thông tin giá của các phụ tùng
            const partIds = partItems.map(p => p.partId);
            const partsFromDb = await tx.part.findMany({
                where: { id: { in: partIds } }
            });

            const partUsageData = [];

            // 3. (THAY ĐỔI LỚN) Trừ kho nguyên tử (Atomic Update)
            for (const item of partItems) {
                const partInfo = partsFromDb.find(p => p.id === item.partId);
                if (!partInfo) {
                    throw new Error(`Invalid Part ID: ${item.partId}`);
                }

                // Lệnh Cập nhật Nguyên tử (Atomic Update)
                const updateResult = await tx.inventoryItem.updateMany({
                    where: {
                        partId: item.partId,
                        serviceCenterId: serviceCenterId,
                        quantityInStock: { gte: item.quantity } // Chỉ update nếu đủ hàng
                    },
                    data: {
                        quantityInStock: {
                            decrement: item.quantity // Trừ trực tiếp
                        }
                    }
                });

                // Nếu count = 0, nghĩa là điều kiện WHERE (đủ hàng) thất bại
                if (updateResult.count === 0) {
                    throw new Error(`Out of stock for ${partInfo.name}. Required: ${item.quantity}. Transaction rolled back.`);
                }

                // Nếu thành công, chuẩn bị tạo PartUsage
                partUsageData.push({
                    serviceRecordId: serviceRecordId,
                    partId: item.partId,
                    quantity: item.quantity,
                    unitPrice: partInfo.price, // Lưu lại giá tại thời điểm sử dụng
                    status: PartUsageStatus.ISSUED // (SỬA) Trạng thái là ISSUED
                });
            }

            // 4. Tạo các bản ghi PartUsage
            await tx.partUsage.createMany({
                data: partUsageData
            });

            return record; // Trả về record gốc (hoặc có thể lấy lại)
        });
    }
}

module.exports = TechnicianRequestParts;