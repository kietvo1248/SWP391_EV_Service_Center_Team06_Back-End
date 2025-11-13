// Tệp: src/interfaces/controllers/technicianController.js
class TechnicianController {
    constructor(
        listTechnicianTasksUseCase, 
        completeTechnicianTaskUseCase, 
        technicianRequestPartsUseCase,
        viewCenterInventoryUseCase, // (THÊM MỚI)
        findPartBySkuUseCase,
        acceptTaskUseCase, // (THÊM MỚI TỪ VĐ 1)
        listCompletedTasksUseCase
    ) {
        this.listTechnicianTasksUseCase = listTechnicianTasksUseCase;
        this.completeTechnicianTaskUseCase = completeTechnicianTaskUseCase;
        this.technicianRequestPartsUseCase = technicianRequestPartsUseCase;
        this.viewCenterInventoryUseCase = viewCenterInventoryUseCase;
        this.findPartBySkuUseCase = findPartBySkuUseCase;
        this.acceptTaskUseCase = acceptTaskUseCase; // (THÊM MỚI TỪ VĐ 1)
        this.listCompletedTasksUseCase = listCompletedTasksUseCase;
    }

    // GET /api/technician/my-tasks
    async listMyTasks(req, res) {
        try {
            const technicianId = req.user.id;
            const { status } = req.query;
            // (SỬA) Mặc định lấy việc PENDING (chờ nhận) hoặc IN_PROGRESS (đang làm)
            const taskStatus = status || ['PENDING', 'IN_PROGRESS'];
            const tasks = await this.listTechnicianTasksUseCase.execute(technicianId, taskStatus);
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // (XÓA) Xóa toàn bộ phương thức 'submitDiagnosis'
    /*
    async submitDiagnosis(req, res) {
        // ... (ĐÃ BỊ XÓA) ...
    }
    */

    // POST /api/technician/service-records/:id/request-parts
    // (SỬA) Đổi tên phương thức để rõ ràng hơn: "sử dụng phụ tùng"
    async useParts(req, res) {
        try {
            const actor = req.user; // KTV
            const { id } = req.params; // ServiceRecord ID
            const { partItems } = req.body; // Mảng [{ partId, quantity }]

            // Use case này đã được viết lại logic (tự động trừ kho)
            const updatedRecord = await this.technicianRequestPartsUseCase.execute(
                id, 
                actor, 
                partItems
            );
            
            res.status(200).json({ 
                message: 'Parts issued and stock updated successfully.', 
                record: updatedRecord 
            });
        } catch (error) {
            // ... (Error handling giữ nguyên) ...
            res.status(400).json({ message: error.message });
        }
    }
    
    // PUT /api/technician/service-records/:id/complete
    async completeTask(req, res) {
        try {
            const technicianId = req.user.id;
            const { id } = req.params; // ServiceRecord ID
            
            // (SỬA LỖI) Đọc "notes" thay vì "completionNotes"
            const { notes } = req.body; // Lấy "notes" từ body

            const result = await this.completeTechnicianTaskUseCase.execute(id, technicianId, notes); // Truyền "notes" vào
            res.status(200).json({ message: 'Task completed successfully.', data: result });
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
    // GET /api/technician/inventory
    async viewInventory(req, res) {
        try {
            const actor = req.user;
            // Tái sử dụng Use Case của Inventory
            const inventoryItems = await this.viewCenterInventoryUseCase.execute(actor);
            res.status(200).json(inventoryItems);
        } catch (error) {
            if (error.message.includes('Forbidden')) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    // GET /api/technician/inventory/search?sku=...
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
    async listCompletedTasks(req, res) {
        try {
            const technicianId = req.user.id;
            const tasks = await this.listCompletedTasksUseCase.execute(technicianId);
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // (BỔ SUNG) PUT /api/technician/service-records/:id/accept
    async acceptTask(req, res) {
        try {
            const technicianId = req.user.id;
            const { id } = req.params; // ServiceRecord ID

            const updatedRecord = await this.acceptTaskUseCase.execute(id, technicianId);
            res.status(200).json({ message: 'Task accepted and moved to IN_PROGRESS.', record: updatedRecord });
        } catch (error) {
             if (error.message.includes('Forbidden')) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message }); // Lỗi nghiệp vụ (vd: task đã accept rồi)
        }
    }

}
module.exports = TechnicianController;