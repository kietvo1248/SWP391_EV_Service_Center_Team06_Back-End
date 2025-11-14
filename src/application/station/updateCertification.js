// Tệp: src/application/station/updateCertification.js
const { Role } = require('@prisma/client');
class UpdateCertification {
    constructor(certificationRepository) {
        this.certRepo = certificationRepository;
    }
    async execute(actor, certId, data) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        
        return this.certRepo.update(certId, data);
    }
}
module.exports = UpdateCertification;