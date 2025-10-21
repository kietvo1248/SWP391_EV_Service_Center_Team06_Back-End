class GetServiceSuggestionsUseCase {
    // để lấy các quy tắc bảo dưỡng.
    // constructor(maintenanceRuleRepository) { ... }

    async execute(vehicleModel, currentMileage) {
        const suggestions = [];
        // Đây là logic gợi ý đơn giản, có thể mở rộng sau này
        if (currentMileage > 20000) {
            suggestions.push("Kiểm tra và thay dầu hộp số (nếu có)");
            suggestions.push("Kiểm tra hệ thống phanh, thay dầu phanh");
        }
        if (currentMileage > 40000) {
            suggestions.push("Kiểm tra và thay nước làm mát pin");
            suggestions.push("Kiểm tra hệ thống lọc gió điều hòa");
        }

        if (vehicleModel === 'VF e34' && currentMileage > 50000) {
            suggestions.push("Bảo dưỡng hệ thống pin cao áp chuyên sâu");
        }

        return suggestions;
    }
}

module.exports = GetServiceSuggestionsUseCase;