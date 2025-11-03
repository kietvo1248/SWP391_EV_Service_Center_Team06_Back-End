class RestockRequest {
    constructor({ id, quantity, status, createdAt, partId, inventoryManagerId, serviceCenterId, stationAdminId, part, inventoryManager, serviceCenter }) {
        this.id = id;
        this.quantity = quantity;
        this.status = status; // PENDING, APPROVED, REJECTED, COMPLETED
        this.createdAt = createdAt;
        this.partId = partId;
        this.inventoryManagerId = inventoryManagerId;
        this.serviceCenterId = serviceCenterId;
        this.stationAdminId = stationAdminId;
        
        // (Optional) Gắn các đối tượng liên quan
        this.part = part; 
        this.inventoryManager = inventoryManager;
        this.serviceCenter = serviceCenter;
    }
}
module.exports = RestockRequest;