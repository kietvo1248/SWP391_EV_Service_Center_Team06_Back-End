const { Decimal } = require('@prisma/client/runtime/library');

class PartUsage {
    constructor({ id, quantity, unitPrice, status, serviceRecordId, partId, part }) {
        this.id = id;
        this.quantity = quantity;
        this.unitPrice = new Decimal(unitPrice);
        this.status = status; // REQUESTED, ISSUED, CANCELLED
        this.serviceRecordId = serviceRecordId;
        this.partId = partId;
        this.part = part; // (Optional) Gắn đối tượng Part
    }
}
module.exports = PartUsage;