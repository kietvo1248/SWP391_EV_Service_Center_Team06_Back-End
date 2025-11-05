// dùng để update chuyên ngành cho kỹ thuật viên
const { Role } = require('@prisma/client');
class updateTechnicianSpecification {
    constructor(technicianProfileRepository, userRepository) {
        this.profileRepo = technicianProfileRepository;
        this.userRepo = userRepository;
    }
    async execute(staffId, { specialization }, actor) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");

        const targetUser = await this.userRepo.findById(staffId);
        if (!targetUser) throw new Error("Technician not found.");
        if (targetUser.role !== Role.TECHNICIAN) throw new Error("This user is not a technician.");
        if (actor.role === Role.STATION_ADMIN && targetUser.serviceCenterId !== actor.serviceCenterId) {
            throw new Error("Forbidden: Cannot manage staff outside your center.");
        }

        return this.profileRepo.upsert(staffId, specialization);
    }
}
module.exports = updateTechnicianSpecification;