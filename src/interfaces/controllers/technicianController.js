class TechnicianController {
    constructor(listTechnicianTasksUseCase, submitDiagnosisUseCase) {
        this.listTechnicianTasksUseCase = listTechnicianTasksUseCase;
        this.submitDiagnosisUseCase = submitDiagnosisUseCase;
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
    
    // TODO: Cần thêm 1 endpoint để KTV hoàn thành công việc
    // PUT /api/technician/service-records/:id/complete
}
module.exports = TechnicianController;