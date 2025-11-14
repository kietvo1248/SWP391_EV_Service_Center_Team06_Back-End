// Tệp: src/application/station/createCertification.js
const { Role } = require('@prisma/client');
class CreateCertification {
    constructor(certificationRepository) {
        this.certRepo = certificationRepository;
    }
    async execute(actor, data) {
        // Chỉ SA hoặc Admin được tạo master data này
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        
        const { name, issuingOrganization } = data;
        if (!name || !issuingOrganization) {
            throw new Error("Name and Issuing Organization are required.");
        }
        
        return this.certRepo.create({ name, issuingOrganization });
    }
}
module.exports = CreateCertification;