class TechnicianController {
    constructor(listTechnicianTasksUseCase, submitDiagnosisUseCase, completeTechnicianTaskUseCase, technicianRequestPartsUseCase) {
        this.listTechnicianTasksUseCase = listTechnicianTasksUseCase;
        this.submitDiagnosisUseCase = submitDiagnosisUseCase;
        this.completeTechnicianTaskUseCase = completeTechnicianTaskUseCase;
        this.technicianRequestPartsUseCase = technicianRequestPartsUseCase;
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
            const actor = req.user; // 1. Lấy actor (KTV) từ token
            const { id } = req.params; // 2. Lấy serviceRecordId từ URL
            
            // 3. Lấy data từ body (đã bỏ estimatedCost theo logic sửa lỗi tài chính)
            const { diagnosisNotes, partUsages } = req.body; 

            const result = await this.submitDiagnosisUseCase.execute(
                id,     // Tham số 1: serviceRecordId
                actor,  // Tham số 2: actor
                { diagnosisNotes, partUsages } // Tham số 3: data
            );
            res.status(200).json({ message: 'Diagnosis submitted. Waiting for customer approval.', ...result });
        } catch (error) { 
            res.status(400).json({ message: error.message }); 
        }
    }
    // POST /api/technician/service-records/:id/request-parts
    async requestParts(req, res) {
        try {
            const actor = req.user; // KTV
            const { id } = req.params; // ServiceRecord ID
            const { partItems } = req.body; // Mảng [{ partId, quantity }]

            const updatedRecord = await this.technicianRequestPartsUseCase.execute(
                id, 
                actor, 
                partItems
            );
            
            res.status(200).json({ 
                message: 'Additional parts requested. Service status set to WAITING_PARTS.', 
                record: updatedRecord 
            });
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