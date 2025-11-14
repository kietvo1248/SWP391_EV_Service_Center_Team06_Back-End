const { Role, Prisma } = require('@prisma/client');

class AddInventoryItem {
    constructor(partRepository, inventoryItemRepository, prismaClient) {
        this.partRepo = partRepository;
        this.inventoryItemRepo = inventoryItemRepository;
        this.prisma = prismaClient;
    }

    async execute(actor, { sku, name, description, price, minStockLevel }) {
        // 1. Phân quyền
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden: Chỉ Quản lý kho hoặc Trưởng trạm mới có quyền thêm mặt hàng.");
        }
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }

        // 2. Validate dữ liệu (Theo yêu cầu của bạn)
        if (!sku || !name || !price) {
            throw new Error("SKU, Tên, và Giá là bắt buộc.");
        }
        if (parseFloat(price) <= 0) {
            throw new Error("Giá tiền phải lớn hơn 0.");
        }
        if (parseInt(minStockLevel) <= 0) {
            throw new Error("Mức tồn kho tối thiểu (minStockLevel) phải lớn hơn 0.");
        }

        return this.prisma.$transaction(async (tx) => {
            let part;
            
            // 3. Tìm `Part` (phụ tùng gốc) bằng SKU
            part = await this.partRepo.findBySku(sku, tx);

            if (part) {
                // 4a. TÌM THẤY `Part`:
                // Logic của bạn: "không cần cập nhật" -> (Chúng ta không chạy lệnh update nào)

                // Kiểm tra xem nó đã tồn tại trong kho của trạm này chưa?
                const existingItem = await this.inventoryItemRepo.findByPartAndCenter(part.id, actor.serviceCenterId);
                
                if (existingItem) {
                    // Logic của bạn: "chỉ thông báo là hàng đã tồn tại"
                    throw new Error(`Mặt hàng (SKU: ${sku}) đã tồn tại trong kho của trạm này.`);
                }
                // Nếu 'part' tồn tại nhưng 'existingItem' không, nghĩa là trạm khác có, trạm này chưa. 
                // Logic sẽ tiếp tục đến bước 5.

            } else {
                // 4b. KHÔNG TÌM THẤY `Part`: Tạo mới (master data)
                part = await this.partRepo.create({ 
                    sku, name, description, 
                    price: parseFloat(price) 
                }, tx);
            }

            // 5. Tạo mục kho (InventoryItem) cho trạm (với quantityInStock = 0)
            const newItem = await tx.inventoryItem.create({
                data: {
                    partId: part.id,
                    serviceCenterId: actor.serviceCenterId,
                    quantityInStock: 0, // Luôn bắt đầu bằng 0
                    minStockLevel: parseInt(minStockLevel),
                    isDeleted: false
                },
                include: { part: true } // Trả về thông tin đầy đủ như bạn mong đợi
            });

            return newItem;
        });
    }
}
module.exports = AddInventoryItem;