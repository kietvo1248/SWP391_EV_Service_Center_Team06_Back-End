// Tệp: src/application/inventory/processRestockRequest.js
const { Role, RestockRequestStatus } = require('@prisma/client');

class ProcessRestockRequest {
    constructor(restockRequestRepository) {
        this.restockRequestRepo = restockRequestRepository;
    }

    async execute(actor, requestId, newStatus) {
        
        // 1. Kiểm tra vai trò hợp lệ (ADMIN hoặc STATION_ADMIN)
        if (![Role.ADMIN, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden: Only ADMIN or STATION_ADMIN can process requests.");
        }

        // 2. Trạng thái mới phải hợp lệ (APPROVED hoặc REJECTED)
        if (![RestockRequestStatus.APPROVED, RestockRequestStatus.REJECTED].includes(newStatus)) {
            throw new Error("Invalid status. Must be APPROVED or REJECTED.");
        }
        
        // 3. Lấy yêu cầu (request)
        const request = await this.restockRequestRepo.findById(requestId);
        if (!request) {
            throw new Error("Restock request not found.");
        }
        
        if (request.status !== RestockRequestStatus.PENDING) {
             throw new Error("This request is not in PENDING status.");
        }

        // 4. Kiểm tra quyền sở hữu (nếu là STATION_ADMIN)
        if (actor.role === Role.STATION_ADMIN) {
            if (!actor.serviceCenterId) {
                throw new Error("Forbidden: Station Admin is not assigned to a center.");
            }
            if (request.serviceCenterId !== actor.serviceCenterId) {
                throw new Error("Forbidden: Station Admin can only process requests for their own center.");
            }
        }
        const updateData = {
            status: newStatus,
            adminId: actor.id, // Ghi lại ID của người đã duyệt (bất kể là Admin hay Station Admin)
            processedAt: new Date()
        };

        return this.restockRequestRepo.update(requestId, updateData);
    }
}

module.exports = ProcessRestockRequest;