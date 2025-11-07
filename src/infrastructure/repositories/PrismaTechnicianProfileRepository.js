// Tệp: src/infrastructure/repositories/PrismaTechnicianProfileRepository.js
const ITechnicianProfileRepository = require('../../domain/repositories/ITechnicianProfileRepository');
class PrismaTechnicianProfileRepository extends ITechnicianProfileRepository {
    constructor(prismaClient) { super(); this.prisma = prismaClient; }
    
    async upsert(userId, specialization) {
        return this.prisma.technicianProfile.upsert({
            where: { userId: userId },
            update: { specialization: specialization },
            create: { userId: userId, specialization: specialization }
        });
    }
}
module.exports = PrismaTechnicianProfileRepository;