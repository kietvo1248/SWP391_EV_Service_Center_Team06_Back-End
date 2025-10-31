// Tệp: src/application/inventory/listIssuanceRequests.js
// Luồng 3.13: Liệt kê các yêu cầu cấp phát linh kiện cho Inventory Manager và Station Admin
const { ServiceRecordStatus, Role } = require('@prisma/client');
class ListIssuanceRequests {
    constructor(serviceRecordRepository) {
        this.serviceRecordRepo = serviceRecordRepository;
    }
    async execute(actor) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden: Access denied.");
        }
        return this.serviceRecordRepo.findByCenterAndStatus(
            actor.serviceCenterId, 
            ServiceRecordStatus.WAITING_PARTS
        );
    }
}
module.exports = ListIssuanceRequests;