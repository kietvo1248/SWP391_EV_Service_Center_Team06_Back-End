// Tệp: src/application/staff/processRestockRequest.js
// luồng cho station admin duyệt yêu cầu đặt hàng
const { RestockRequestStatus, Role } = require('@prisma/client');
class ProcessRestockRequest {
     constructor(restockRequestRepository) {
        this.restockRequestRepo = restockRequestRepository;
    }
    async execute(requestId, actor, didApprove) {
        if (actor.role !== Role.STATION_ADMIN) throw new Error("Forbidden.");

        const request = await this.restockRequestRepo.findById(requestId);
        if (!request) throw new Error("Request not found.");
        if (request.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden. Request is not in your center.");
        }
        if (request.status !== RestockRequestStatus.PENDING) {
            throw new Error("Request has already been processed.");
        }
        
        const newStatus = didApprove ? RestockRequestStatus.APPROVED : RestockRequestStatus.REJECTED;
        
        return this.restockRequestRepo.update(requestId, {
            status: newStatus,
            stationAdminId: actor.id,
            processedAt: new Date()
        });
    }
}
module.exports = ProcessRestockRequest;