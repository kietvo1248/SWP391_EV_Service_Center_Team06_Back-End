class InventoryController {
    constructor(
        viewInventoryUseCase,
        findPartBySkuUseCase,
        addInventoryItemUseCase,      // Mới
        updateInventoryItemUseCase, // Mới
        removeInventoryItemUseCase,   // Mới
        listLowStockItemsUseCase,     // Mới
        createRestockRequestUseCase,
        listRestockRequestsUseCase,   // Mới (Dùng chung cho IM xem lịch sử)
        importRestockUseCase,          // Mới
        processRestockRequestUseCase,
        getInventoryItemDetailsUseCase
    ) {
        this.viewInventoryUseCase = viewInventoryUseCase;
        this.findPartBySkuUseCase = findPartBySkuUseCase;
        this.addInventoryItemUseCase = addInventoryItemUseCase;
        this.updateInventoryItemUseCase = updateInventoryItemUseCase;
        this.removeInventoryItemUseCase = removeInventoryItemUseCase;
        this.listLowStockItemsUseCase = listLowStockItemsUseCase;
        this.createRestockRequestUseCase = createRestockRequestUseCase;
        this.listRestockRequestsUseCase = listRestockRequestsUseCase;
        this.importRestockUseCase = importRestockUseCase;
        this.processRestockRequestUseCase = processRestockRequestUseCase;
        this.getInventoryItemDetailsUseCase = getInventoryItemDetailsUseCase;
    }

    // --- 1. Quản lý Kho (CRUD) ---

    async viewInventory(req, res) {
        try {
            const items = await this.viewInventoryUseCase.execute(req.user);
            res.status(200).json(items);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async findPartBySku(req, res) {
        try {
            const { sku } = req.query;
            const item = await this.findPartBySkuUseCase.execute(sku, req.user);
            res.status(200).json(item);
            
        } catch (error) { 
            if (error.message.includes('Forbidden')) return res.status(403).json({ message: error.message });
            res.status(400).json({ message: error.message }); 
        }
    }

    // (Mới) Thêm mặt hàng vào kho
    async addInventoryItem(req, res) {
        try {
            // Lấy tất cả thông tin từ body
            const { sku, name, description, price, minStockLevel } = req.body;
            
            const item = await this.addInventoryItemUseCase.execute(req.user, { 
                sku, name, description, price, minStockLevel 
            });
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    
    async getInventoryItemDetails(req, res) {
        try {
            const { id } = req.params; // Lấy ID của InventoryItem
            const item = await this.getInventoryItemDetailsUseCase.execute(req.user, id);
            res.status(200).json(item);
        } catch (error) { 
            if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
            if (error.message.includes('Forbidden')) return res.status(403).json({ message: error.message });
            res.status(400).json({ message: error.message }); 
        }
    }

    async updateInventoryItem(req, res) {
        try {
            const { id } = req.params; // Lấy ID của InventoryItem
            
            // Lấy tất cả dữ liệu có thể cập nhật từ body
            const { sku, name, description, price, minStockLevel } = req.body;
            
            const item = await this.updateInventoryItemUseCase.execute(req.user, id, { 
                sku, name, description, price, minStockLevel 
            });
            res.status(200).json(item);
        } catch (error) { 
            res.status(400).json({ message: error.message }); 
        }
    }

    // (Mới) Xóa mềm
    async removeInventoryItem(req, res) {
        try {
            const { id } = req.params;
            await this.removeInventoryItemUseCase.execute(req.user, id);
            res.status(204).send();
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // (Mới) Cảnh báo sắp hết hàng
    async listLowStock(req, res) {
        try {
            const items = await this.listLowStockItemsUseCase.execute(req.user);
            res.status(200).json(items);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // --- 2. Quy trình Nhập hàng ---

    async createRestockRequest(req, res) {
        try {
            const { partId, quantity, notes } = req.body;
            const request = await this.createRestockRequestUseCase.execute({ partId, quantity: Number(quantity), notes }, req.user);
            res.status(201).json(request);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // (Mới) Xem danh sách yêu cầu (cho IM xem lịch sử/trạng thái)
    async listRestockRequests(req, res) {
        try {
            const { status } = req.query;
            const requests = await this.listRestockRequestsUseCase.execute(status, req.user);
            res.status(200).json(requests);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // (Mới) Nhập kho (Finalize)
    async importRestock(req, res) {
        try {
            const { requestId } = req.params;
            const result = await this.importRestockUseCase.execute(req.user, requestId);
            res.status(200).json({ message: "Stock imported successfully.", request: result });
        } catch (error) { res.status(400).json({ message: error.message }); }
    }


    // --- PHÊ DUYỆT NHẬP HÀNG (Station Admin) ---

    async approveRestockRequest(req, res) {
        try {
            const { id } = req.params; // Request ID
            const { notes } = req.body; // Ghi chú tùy chọn
            const request = await this.processRestockRequestUseCase.execute(
                req.user, 
                id, 
                'APPROVED', // Trạng thái cứng
                notes
            );
            res.status(200).json({ message: "Request approved.", request });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async rejectRestockRequest(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;
            const request = await this.processRestockRequestUseCase.execute(
                req.user, 
                id, 
                'REJECTED', // Trạng thái cứng
                notes
            );
            res.status(200).json({ message: "Request rejected.", request });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
module.exports = InventoryController;