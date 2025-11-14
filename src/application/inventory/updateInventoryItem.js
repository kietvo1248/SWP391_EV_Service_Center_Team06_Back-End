// Tệp: src/application/inventory/updateInventoryItem.js
const { Role, Prisma } = require('@prisma/client');

class UpdateInventoryItem {
    constructor(inventoryItemRepo, partRepo, restockRequestRepo, prismaClient) {
        this.inventoryItemRepo = inventoryItemRepo;
        this.partRepo = partRepo;
        this.restockRequestRepo = restockRequestRepo;
        this.prisma = prismaClient;
    }

    async execute(actor, inventoryItemId, updateData) {
        // 1. Phân quyền
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden: Chỉ Quản lý kho hoặc Trưởng trạm mới có quyền cập nhật.");
        }
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }

        const { sku, name, description, price, minStockLevel } = updateData;

        // 2. Validate dữ liệu đầu vào (Theo yêu cầu của bạn)
        if (minStockLevel !== undefined && parseInt(minStockLevel) <= 0) {
            throw new Error("Mức tồn kho tối thiểu (minStockLevel) phải lớn hơn 0.");
        }
        if (price !== undefined && parseFloat(price) <= 0) {
            throw new Error("Giá tiền phải lớn hơn 0.");
        }
        if (sku === '' || name === '') {
            throw new Error("SKU và Tên không được để trống.");
        }
        
        return this.prisma.$transaction(async (tx) => {
            // 3. Tìm món hàng trong kho
            const item = await this.inventoryItemRepo.findById(inventoryItemId);
            if (!item || item.serviceCenterId !== actor.serviceCenterId) {
                throw new Error("Mặt hàng không tồn tại trong kho của trạm này.");
            }
            
            // 4. KIỂM TRA RÀNG BUỘC QUAN TRỌNG (Yêu cầu của bạn)
            const activeRequest = await this.restockRequestRepo.findActiveByPartAndCenter(
                item.partId, 
                actor.serviceCenterId
            );

            if (activeRequest) {
                throw new Error(`Không thể cập nhật. Mặt hàng này đang có Yêu cầu Nhập hàng (ID: ${activeRequest.id}) ở trạng thái ${activeRequest.status}.`);
            }

            // 5. Nếu không bị chặn, tiến hành cập nhật
            
            // 5a. Cập nhật thông tin gốc (Part - Master Data)
            // Lấy thông tin Part hiện tại để điền vào các trường không thay đổi
            const currentPart = await this.partRepo.findById(item.partId, tx);
            
            await this.partRepo.update(item.partId, {
                sku: sku !== undefined ? sku : currentPart.sku,
                name: name !== undefined ? name : currentPart.name,
                description: description !== undefined ? description : currentPart.description,
                price: price !== undefined ? parseFloat(price) : currentPart.price,
            }, tx);

            // 5b. Cập nhật thông tin kho (InventoryItem)
            if (minStockLevel !== undefined) {
                 await this.inventoryItemRepo.update(inventoryItemId, { 
                    minStockLevel: parseInt(minStockLevel) 
                }, tx);
            }

            // 6. Lấy lại dữ liệu đầy đủ để trả về
            const updatedItem = await tx.inventoryItem.findFirst({
                where: { id: inventoryItemId },
                include: { part: true }
            });

            return updatedItem;
        });
    }
}
module.exports = UpdateInventoryItem;