//Luồng 3.2
const { ServiceRecordStatus } = require('@prisma/client');

class ListRequestsForIssuing {
    constructor(serviceRecordRepository) {
        this.serviceRecordRepository=serviceRecordRepository;
    }
    async execute(actor) {
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }
        // Cần cập nhật findByTechnician để hỗ trợ lọc theo serviceCenterId
        return this.serviceRecordRepo.findByCenterAndStatus(
            actor.serviceCenterId, 
            ServiceRecordStatus.WAITING_PARTS
        );
    }
}
module.exports = ListRequestsForIssuing;