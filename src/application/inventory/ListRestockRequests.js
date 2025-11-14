// Tệp: src/application/inventory/ListRestockRequests.js
// (SỬA LẠI) - Dành cho IM và SA xem yêu cầu tại trạm của mình
const { Role } = require('@prisma/client');

class ListRestockRequests {
    constructor(restockRequestRepository) {
        this.restockRequestRepo = restockRequestRepository;
    }
    
    async execute(status, actor) {
        // (SỬA 1) Cho phép IM và SA
        const allowedRoles = [Role.INVENTORY_MANAGER, Role.STATION_ADMIN];
        if (!allowedRoles.includes(actor.role)) {
            throw new Error("Forbidden.");
        }

        // (SỬA 2) Yêu cầu phải có trung tâm
        if (!actor.serviceCenterId) {
            throw new Error("User is not associated with a service center.");
        }
        
        // (SỬA 3) Lọc theo trung tâm của người dùng, không phải "findAll"
        return this.restockRequestRepo.findByCenter(actor.serviceCenterId, status); 
    }
}
module.exports = ListRestockRequests;