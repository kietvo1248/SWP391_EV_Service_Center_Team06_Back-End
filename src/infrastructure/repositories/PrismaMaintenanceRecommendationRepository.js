// Tệp: src/infrastructure/repositories/PrismaMaintenanceRecommendationRepository.js
const IMaintenanceRecommendationRepository = require('../../domain/repositories/IMaintenanceRecommendationRepository');

class PrismaMaintenanceRecommendationRepository extends IMaintenanceRecommendationRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async findByMilestone(milestone, model) {
        // Tìm các gợi ý khớp chính xác mốc km VÀ
        // (khớp với model cụ thể HOẶC khớp với "ALL")
        const recommendations = await this.prisma.maintenanceRecommendation.findMany({
            where: {
                mileageMilestone: milestone,
                model: {
                    in: [model, 'ALL'] // Lấy cả gợi ý chung và gợi ý riêng cho dòng xe
                }
            },
            include: {
                serviceType: true // kấy thông tin dịch vụ
            }
        });

        // Trích xuất và trả về chỉ danh sách các ServiceType
        return recommendations.map(rec => rec.serviceType);
    }
}
module.exports = PrismaMaintenanceRecommendationRepository;