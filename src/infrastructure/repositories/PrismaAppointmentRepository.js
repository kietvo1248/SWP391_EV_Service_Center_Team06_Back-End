const IAppointmentRepository = require('../../domain/repositories/IAppointmentRepository');

class PrismaAppointmentRepository extends IAppointmentRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async add(appointmentData) {
        return this.prisma.serviceAppointment.create({
            data: appointmentData,
        });
    }
}

module.exports = PrismaAppointmentRepository;
