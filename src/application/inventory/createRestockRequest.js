// Tệp: src/application/inventory/createRestockRequest.js
const { Role } = require('@prisma/client');
class CreateRestockRequest {
    constructor(restockRequestRepository, partRepository) {
        this.restockRequestRepo = restockRequestRepository;
        this.partRepo = partRepository;
    }
    async execute(partId, quantity, actor) {
        if (![Role.INVENTORY_MANAGER, Role.STATION_ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }
        const part = await this.partRepo.findById(partId); 
        if (!part) throw new Error("Part not found.");
        if (quantity <= 0) throw new Error("Quantity must be positive.");

        return this.restockRequestRepo.create({
            partId: partId,
            quantity: quantity,
            inventoryManagerId: actor.id,
            serviceCenterId: actor.serviceCenterId,
            status: 'PENDING',
        });
    }
}
module.exports = CreateRestockRequest;