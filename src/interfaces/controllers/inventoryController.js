// Tệp: src/interfaces/controllers/inventoryController.js
class InventoryController {
    constructor(
        viewInventoryUseCase,
        updateStockQuantityUseCase,
        listRequestsForIssuingUseCase,
        issuePartsForServiceUseCase,
        createRestockRequestUseCase,
        receiveStockUseCase
    ) {
        this.viewInventoryUseCase = viewInventoryUseCase;
        this.updateStockQuantityUseCase = updateStockQuantityUseCase;
        this.listRequestsForIssuingUseCase = listRequestsForIssuingUseCase;
        this.issuePartsForServiceUseCase = issuePartsForServiceUseCase;
        this.createRestockRequestUseCase = createRestockRequestUseCase;
        this.receiveStockUseCase = receiveStockUseCase;
    }

    // Luồng 3.1
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
    
    // Luồng 3.2
    async listRequestsForIssuing(req, res) {
        try {
            const records = await this.listRequestsForIssuingUseCase.execute(req.user);
            res.status(200).json(records);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    async issueParts(req, res) {
        try {
            const { serviceRecordId } = req.params;
            const record = await this.issuePartsForServiceUseCase.execute(serviceRecordId, req.user);
            res.status(200).json({ message: 'Parts issued successfully.', record });
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // Luồng 3.3
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
}
module.exports = InventoryController;