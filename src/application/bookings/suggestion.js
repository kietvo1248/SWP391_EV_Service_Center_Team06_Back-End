// Tệp: src/application/bookings/suggestion.js
const ServiceTypeEntity = require('../../domain/entities/ServiceType');

class GetServiceSuggestions {
    constructor(recommendationRepository) {
        // Chỉ cần recommendationRepository
        this.recommendationRepo = recommendationRepository;
    }

    /**
     * Tìm mốc km gần nhất (làm tròn lên hoặc xuống 5000km)
     * Ví dụ: 9000 -> 10000, 11000 -> 10000, 14000 -> 15000
     */
    _findTargetMilestone(mileage) {
        const base = 5000; // Gợi ý theo các mốc 5.000 km
        if (mileage <= 0) return 0;
        
        const target = Math.round(mileage / base) * base;
        
        // Nếu làm tròn về 0 (ví dụ: mileage = 1000),
        // thì lấy mốc đầu tiên là 5000
        return target === 0 ? base : target;
    }

    async execute({ mileage, model }) {
        const mileageNumber = parseInt(mileage, 10);
        if (isNaN(mileageNumber) || !model) {
            throw new Error("Mileage (number) and model (string) are required.");
        }

        // 1. Tìm mốc km mục tiêu
        const targetMilestone = this._findTargetMilestone(mileageNumber);

        // 2. Gọi Repository để lấy các dịch vụ
        const serviceTypesPrisma = await this.recommendationRepo.findByMilestone(targetMilestone, model);
        
        // 3. Chuyển đổi sang Entities
        return serviceTypesPrisma.map(st => new ServiceTypeEntity(st));
    }
}

module.exports = GetServiceSuggestions;