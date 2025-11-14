// Tệp: src/infrastructure/repositories/PrismaStaffCertificationRepository.js
const IStaffCertificationRepository = require('../../domain/repositories/IStaffCertificationRepository');

class PrismaStaffCertificationRepository extends IStaffCertificationRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    // Gán chứng chỉ
    async assign(data) {
        return this.prisma.staffCertification.create({
            data: data, // data = { staffId, certificationId, certificateNumber }
        });
    }

    // Thu hồi chứng chỉ
    async revoke(staffId, certificationId) {
        return this.prisma.staffCertification.delete({
            where: {
                staffId_certificationId: {
                    staffId: staffId,
                    certificationId: certificationId,
                },
            },
        });
    }

    // Tìm theo mã số (để kiểm tra trùng lặp)
    async findByCertificateNumber(number) {
        return this.prisma.staffCertification.findUnique({
            where: { certificateNumber: number },
        });
    }
    async countByCertificationId(certificationId) {
        return this.prisma.staffCertification.count({
            where: { certificationId: certificationId }
        });
    }
}
module.exports = PrismaStaffCertificationRepository;