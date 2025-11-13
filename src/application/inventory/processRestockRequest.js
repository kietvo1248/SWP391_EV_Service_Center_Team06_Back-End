const { Role, RestockRequestStatus } = require('@prisma/client');

class ProcessRestockRequest {
    constructor(restockRequestRepo) {
        this.restockRequestRepo = restockRequestRepo;
    }

    /**
     * Xử lý duyệt hoặc từ chối yêu cầu nhập hàng
     * @param {Object} actor - Người thực hiện (phải là Station Admin)
     * @param {String} requestId - ID của yêu cầu
     * @param {String} status - Trạng thái mới (APPROVED hoặc REJECTED)
     * @param {String} notes - Ghi chú thêm của quản lý (tùy chọn)
     */
    async execute(actor, requestId, status, notes) {
        // 1. Kiểm tra quyền: Chỉ Station Admin mới được duyệt
        if (actor.role !== Role.STATION_ADMIN) {
            throw new Error("Forbidden: Only Station Admin can process restock requests.");
        }

        // 2. Lấy thông tin yêu cầu
        const request = await this.restockRequestRepo.findById(requestId);
        if (!request) {
            throw new Error("Restock request not found.");
        }

        // 3. Kiểm tra xem yêu cầu có thuộc trạm của Admin này không
        if (request.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden: This request belongs to another service center.");
        }

        // 4. Kiểm tra trạng thái hiện tại (Phải là PENDING mới được duyệt)
        if (request.status !== RestockRequestStatus.PENDING) {
            throw new Error(`Cannot process request. Current status is ${request.status}.`);
        }

        // 5. Kiểm tra trạng thái đích hợp lệ
        if (![RestockRequestStatus.APPROVED, RestockRequestStatus.REJECTED].includes(status)) {
            throw new Error("Invalid status. Must be APPROVED or REJECTED.");
        }

        // 6. Cập nhật DB
        // Lưu ý: Ta cập nhật adminId (người duyệt) và processedAt (ngày duyệt)
        // Nếu có ghi chú mới thì nối thêm vào ghi chú cũ
        const updatedNotes = notes 
            ? (request.notes ? `${request.notes}\n[${status}]: ${notes}` : notes)
            : request.notes;

        return this.restockRequestRepo.update(requestId, {
            status: status,
            adminId: actor.id, // ID của Station Admin
            processedAt: new Date(),
            notes: updatedNotes
        });
    }
}

module.exports = ProcessRestockRequest;