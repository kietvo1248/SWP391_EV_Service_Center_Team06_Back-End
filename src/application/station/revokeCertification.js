// Tệp: src/application/station/revokeCertification.js
const { Role } = require('@prisma/client');
class RevokeCertification {
    constructor(staffCertificationRepository, userRepository) {
        this.staffCertRepo = staffCertificationRepository;
        this.userRepo = userRepository;
    }
    async execute(staffId, certificationId, actor) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        
        const targetUser = await this.userRepo.findById(staffId);
        if (!targetUser) throw new Error("Staff member not found.");
        
        if (actor.role === Role.STATION_ADMIN && targetUser.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden: Cannot manage staff outside your center.");
        }
        
        try {
            return await this.staffCertRepo.revoke(staffId, certificationId);
        } catch (e) { // mã lỗi của prisma
            if (e.code === 'P2025') throw new Error("Assignment not found to revoke.");
            throw e;
        }
    }
}
module.exports = RevokeCertification;