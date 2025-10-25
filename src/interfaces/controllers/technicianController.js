class TechnicianController {
    constructor(listTechnicianTasksUseCase, submitDiagnosisUseCase, completeTechnicianTaskUseCase) {
        this.listTechnicianTasksUseCase = listTechnicianTasksUseCase;
        this.submitDiagnosisUseCase = submitDiagnosisUseCase;
        this.completeTechnicianTaskUseCase = completeTechnicianTaskUseCase;
    }

    // GET /api/technician/my-tasks
    async listMyTasks(req, res) {
        try {
            const technicianId = req.user.id;
            const { status } = req.query;
            const tasks = await this.listTechnicianTasksUseCase.execute(technicianId, status);
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // POST /api/technician/service-records/:id/diagnose
    async submitDiagnosis(req, res) {
        try {
            const technicianId = req.user.id;
            const { id } = req.params; // ServiceRecord ID
            const { estimatedCost, diagnosisNotes } = req.body;

            const result = await this.submitDiagnosisUseCase.execute({
                technicianId,
                serviceRecordId: id,
                estimatedCost,
                diagnosisNotes
            });
            res.status(200).json({ message: 'Diagnosis submitted. Waiting for customer approval.', appointment: result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    
    // PUT /api/technician/service-records/:id/complete
    async completeTask(req, res) {
        try {
            const technicianId = req.user.id;
            const { id } = req.params; // ServiceRecord ID
            const { completionNotes } = req.body;

            const result = await this.completeTechnicianTaskUseCase.execute(id, technicianId, completionNotes);
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
}
module.exports = TechnicianController;