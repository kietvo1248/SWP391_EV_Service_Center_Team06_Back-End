// Tệp: src/application/admin/listRestockRequests.js
const { RestockRequestStatus, Role } = require('@prisma/client');
class ListRestockRequests {
    constructor(restockRequestRepository) {
        this.restockRequestRepo = restockRequestRepository;
    }
    async execute(status, actor) {
        if (actor.role !== Role.ADMIN) throw new Error("Forbidden.");
        
        return this.restockRequestRepo.findAll(status); // Admin xem tất cả
    }
}
module.exports = ListRestockRequests;