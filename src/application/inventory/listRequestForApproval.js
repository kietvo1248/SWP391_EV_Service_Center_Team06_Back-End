// Tệp: src/application/staff/listRestockRequestsForApproval.js
// luồng cho station admin duyệt yêu cầu đặt hàng
const { RestockRequestStatus, Role } = require('@prisma/client');
class ListRestockRequestsForApproval {
    constructor(restockRequestRepository) {
        this.restockRequestRepo = restockRequestRepository;
    }
    async execute(actor) {
        if (actor.role !== Role.STATION_ADMIN) throw new Error("Forbidden.");
        
        return this.restockRequestRepo.findByCenter(
            actor.serviceCenterId, 
            RestockRequestStatus.PENDING
        );
    }
}
module.exports = ListRestockRequestsForApproval;