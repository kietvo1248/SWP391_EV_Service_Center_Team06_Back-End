const { Role } = require('@prisma/client');
class AssignCertification {
    constructor(staffCertificationRepository, userRepository, certificationRepository) {
        this.staffCertRepo = staffCertificationRepository;
        this.userRepo = userRepository;
        this.certRepo = certificationRepository;
    }
    async execute(staffId, certificationId, certificateNumber, actor) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        
        // 1. Kiểm tra Mã số chứng chỉ (duy nhất)
        if (!certificateNumber) throw new Error("Certificate number is required.");
        const existingNumber = await this.staffCertRepo.findByCertificateNumber(certificateNumber);
        if (existingNumber) {
            throw new Error("This certificate number is already registered to another staff member.");
        }

        // 2. Kiểm tra Nhân viên và Chứng chỉ
        const [targetUser, certification] = await Promise.all([
            this.userRepo.findById(staffId),
            this.certRepo.findById(certificationId)
        ]);
        if (!targetUser) throw new Error("Staff member not found.");
        if (!certification) throw new Error("Certification type not found.");
        
        // 3. Kiểm tra Quyền (SA chỉ gán cho nhân viên trạm mình)
        if (actor.role === Role.STATION_ADMIN && targetUser.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden: Cannot assign certification to staff outside your center.");
        }
        
        try {
            return await this.staffCertRepo.assign({
                staffId, 
                certificationId, 
                certificateNumber // Gửi mã số
            });
        } catch (e) {
            if (e.code === 'P2002') throw new Error("Staff already has this certification type.");
            throw e;
        }
    }
}
module.exports = AssignCertification;