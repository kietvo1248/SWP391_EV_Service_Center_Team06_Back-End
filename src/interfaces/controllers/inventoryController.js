// Tệp: src/interfaces/controllers/inventoryController.js
class InventoryController {
    constructor(
        viewInventoryUseCase,
        updateStockQuantityUseCase,
        // listRequestsForIssuingUseCase, // (XÓA)
        // issuePartsForServiceUseCase, // (XÓA)
        createRestockRequestUseCase,
        receiveStockUseCase,
        findPartBySkuUseCase
    ) {
        this.viewInventoryUseCase = viewInventoryUseCase;
        this.updateStockQuantityUseCase = updateStockQuantityUseCase;
        // this.listRequestsForIssuingUseCase = listRequestsForIssuingUseCase; // (XÓA)
        // this.issuePartsForServiceUseCase = issuePartsForServiceUseCase; // (XÓA)
        this.createRestockRequestUseCase = createRestockRequestUseCase;
        this.receiveStockUseCase = receiveStockUseCase;
        this.findPartBySkuUseCase = findPartBySkuUseCase;
    }

    // ... (viewInventory, updateStockQuantity giữ nguyên) ...
    async viewInventory(req, res) {
        try {
            const items = await this.viewInventoryUseCase.execute(req.user);
            res.status(200).json(items);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    async updateStockQuantity(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            const item = await this.updateStockQuantityUseCase.execute(id, Number(quantity), req.user);
            res.status(200).json(item);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // (XÓA) Xóa phương thức 'listRequestsForIssuing'
    /*
    async listRequestsForIssuing(req, res) { ... }
    */

    // (XÓA) Xóa phương thức 'issueParts'
    /*
    async issueParts(req, res) { ... }
    */

    // ... (createRestockRequest, receiveStock giữ nguyên) ...
    async createRestockRequest(req, res) {
        try {
            const { partId, quantity } = req.body;
            const request = await this.createRestockRequestUseCase.execute({ partId, quantity: Number(quantity) }, req.user);
            res.status(201).json(request);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    async receiveStock(req, res) {
        try {
            const { requestId, quantityReceived } = req.body;
            const item = await this.receiveStockUseCase.execute(requestId, Number(quantityReceived), req.user);
            res.status(200).json({ message: 'Stock received successfully.', item });
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    // GET /api/inventory/items/search?sku=...
    async findPartBySku(req, res) {
        try {
            const actor = req.user;
            const { sku } = req.query;
            const item = await this.findPartBySkuUseCase.execute(sku, actor);
            res.status(200).json(item);
        } catch (error) {
            if (error.message.includes('Forbidden')) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }
}
module.exports = InventoryController;