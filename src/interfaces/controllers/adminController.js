// Tệp: src/interfaces/controllers/adminController.js
class AdminController {
    constructor(
        listRestockRequestsUseCase,
        processRestockRequestUseCase
    ) {
        this.listRestockRequestsUseCase = listRestockRequestsUseCase;
        this.processRestockRequestUseCase = processRestockRequestUseCase;
    }

    async listRestockRequests(req, res) {
        try {
            const { status } = req.query;
            const requests = await this.listRestockRequestsUseCase.execute(status, req.user);
            res.status(200).json(requests);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    async approveRestockRequest(req, res) {
        try {
            const { id } = req.params;
            const request = await this.processRestockRequestUseCase.execute(id, req.user, true);
            res.status(200).json({ message: 'Request approved.', request });
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    async rejectRestockRequest(req, res) {
        try {
            const { id } = req.params;
            const request = await this.processRestockRequestUseCase.execute(id, req.user, false);
            res.status(200).json({ message: 'Request rejected.', request });
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
}
module.exports = AdminController;