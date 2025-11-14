// Tệp: src/application/station/updateTechnicianSpecification.js
const { Role } = require('@prisma/client');

class UpdateTechnicianSpecification {
    constructor(technicianProfileRepository, userRepository) {
        this.technicianProfileRepo = technicianProfileRepository;
        this.userRepo = userRepository; // Dùng để kiểm tra trạm
    }

    async execute(actor, technicianId, specialization) {
        // 1. Kiểm tra quyền của người thực hiện
        if (actor.role !== Role.STATION_ADMIN) {
            throw new Error("Forbidden: Only Station Admins can update specifications.");
        }
        if (!actor.serviceCenterId) {
            throw new Error("Forbidden: Actor is not assigned to any station.");
        }

        // 2. Kiểm tra KTV mục tiêu
        const technician = await this.userRepo.findById(technicianId);
        if (!technician || technician.role !== Role.TECHNICIAN) {
            throw new Error("Technician not found.");
        }

        // 3. (Quan trọng) Kiểm tra KTV có thuộc trạm của Trưởng trạm không
        if (technician.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden: This technician does not belong to your station.");
        }
        
        if (typeof specialization === 'undefined' || specialization === null) {
            throw new Error("Specialization cannot be empty.");
        }

        // 4. (SỬA) Sử dụng logic 'upsert' (Cập nhật hoặc Tạo mới)
        // Repository đã hỗ trợ
        return this.technicianProfileRepo.upsert(
            technicianId, 
            specialization
        );
    }
}

module.exports = UpdateTechnicianSpecification;