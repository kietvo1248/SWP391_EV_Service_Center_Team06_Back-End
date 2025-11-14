// Tệp: src/application/station/getStaffDetails.js
const { Role } = require('@prisma/client');
class GetStaffDetails {
    constructor(userRepository) {
        this.userRepo = userRepository;
    }
    async execute(actor, staffId) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        
        // (SỬA) Luôn lấy serviceCenterId của actor (Trưởng trạm)
        const serviceCenterId = actor.serviceCenterId;
        if (!serviceCenterId) {
            throw new Error("Actor is not assigned to a center.");
        }

        const staff = await this.userRepo.findStaffByIdAndCenter(staffId, serviceCenterId);
        
        if (!staff) {
            throw new Error("Staff not found in your center.");
        }
        return staff;
    }
}
module.exports = GetStaffDetails;