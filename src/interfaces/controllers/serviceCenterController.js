// Tệp: src/interfaces/controllers/serviceCenterController.js

class ServiceCenterController {
    constructor(listAllServiceCentersUseCase) {
        this.listAllServiceCentersUseCase = listAllServiceCentersUseCase;
    }

    /**
     * Xử lý yêu cầu GET / để lấy tất cả trung tâm
     */
    async listAll(req, res) {
        try {
            const centers = await this.listAllServiceCentersUseCase.execute();
            res.status(200).json(centers);
        } catch (error) {
            console.error('Error listing service centers:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAvailableSlots(req, res) {
        try {
            const { id } = req.params;
            const { date } = req.query; // Lấy từ query string ?date=...

            const slots = await this.getAvailableSlotsUseCase.execute(id, date);
            res.status(200).json(slots);
            
        } catch (error) {
            // Phân loại lỗi
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('required') || error.message.includes('Invalid date')) {
                return res.status(400).json({ message: error.message });
            }
            
            console.error('Error getting available slots:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Các phương thức khác (CRUD) sẽ được thêm sau
}

module.exports = ServiceCenterController;