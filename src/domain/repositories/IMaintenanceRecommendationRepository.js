// gợi ý dịch vụ bảo dưỡng dựa trên mốc km và dòng xe
class IMaintenanceRecommendationRepository {
    /**
     * Tìm các dịch vụ được gợi ý dựa trên mốc km và dòng xe
     * @param {number} milestone - Mốc km (vd: 10000, 20000)
     * @param {string} model - Dòng xe (vd: "VF8")
     * @returns {Promise<Array>} Danh sách các ServiceType
     */
    async findByMilestone(milestone, model) {
        throw new Error("Method 'findByMilestone()' must be implemented.");
    }
}
module.exports = IMaintenanceRecommendationRepository;