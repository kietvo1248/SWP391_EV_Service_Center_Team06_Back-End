// Tệp: src/application/bookings/suggestion.js
const ServiceTypeEntity = require('../../domain/entities/ServiceType');

class GetServiceSuggestions {
    constructor(recommendationRepository, vehicleRepository) { // (THÊM MỚI)
        this.recommendationRepo = recommendationRepository;
        this.vehicleRepo = vehicleRepository; // (THÊM MỚI)
    }

    _findTargetMilestone(mileage) {
        const base = 5000; 
        if (mileage <= 0) return 0;
        const target = Math.round(mileage / base) * base;
        return target === 0 ? base : target;
    }

    // (SỬA) Chỉ nhận vehicleId và ownerId
    async execute({ vehicleId, ownerId }) {
        if (!vehicleId || !ownerId) {
            throw new Error("Vehicle ID and Owner ID are required.");
        }

        // 1. (MỚI) Lấy thông tin xe từ CSDL
        const vehicle = await this.vehicleRepo.findById(vehicleId, ownerId);
        if (!vehicle) {
            throw new Error("Vehicle not found or you do not have permission.");
        }

        // 2. (MỚI) Lấy số km và model từ xe
        const mileageNumber = vehicle.currentMileage || 0;
        const modelName = vehicle.vehicleModel.name; // Ví dụ: "VF8"

        // 3. Tìm mốc km mục tiêu
        const targetMilestone = this._findTargetMilestone(mileageNumber);
        if (targetMilestone === 0) {
            return []; // Không có gợi ý cho xe 0km
        }

        // 4. Gọi Repository để lấy các dịch vụ
        const serviceTypesPrisma = await this.recommendationRepo.findByMilestone(targetMilestone, modelName);
        return serviceTypesPrisma.map(st => new ServiceTypeEntity(st));
    }
}

module.exports = GetServiceSuggestions;