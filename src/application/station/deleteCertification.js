// Tệp: src/application/station/deleteCertification.js
const { Role } = require('@prisma/client');

class DeleteCertification {
    // (SỬA) Thêm staffCertificationRepository
    constructor(certificationRepository, staffCertificationRepository) {
        this.certRepo = certificationRepository;
        this.staffCertRepo = staffCertificationRepository;
    }

    async execute(actor, certId) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) {
            throw new Error("Forbidden.");
        }
        
        // (THÊM MỚI) Validation ở tầng nghiệp vụ (yêu cầu của bạn)
        const staffCount = await this.staffCertRepo.countByCertificationId(certId);
        if (staffCount > 0) {
            throw new Error(`Không thể xóa chứng chỉ. Chứng chỉ này vẫn đang được gán cho ${staffCount} nhân viên. Vui lòng thu hồi trước.`);
        }
        
        // Nếu staffCount = 0, tiến hành xóa
        try {
            return await this.certRepo.delete(certId);
        } catch (e) {
            // (DỰ PHÒNG) Bắt lỗi CSDL P2003 (đã bị chặn ở trên, nhưng để an toàn)
            if (e.code === 'P2003') { 
                throw new Error("Không thể xóa chứng chỉ. Chứng chỉ này vẫn đang được gán (Lỗi CSDL).");
            }
            throw e;
        }
    }
}
module.exports = DeleteCertification;