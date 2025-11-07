const { Role } = require('@prisma/client');
class UpdateStaffStatus {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(staffId, isActive, actor) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        
        const targetUser = await this.userRepository.findById(staffId);
        if (!targetUser) throw new Error("User not found.");
        
        if (actor.role === Role.STATION_ADMIN && targetUser.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden: Cannot manage staff outside your center.");
        }
        
        return this.userRepository.updateStatus(staffId, isActive);
    }
}
module.exports = UpdateStaffStatus;