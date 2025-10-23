// Tệp: src/infrastructure/repositories/PrismaServiceRecordRepository.js
const IServiceRecordRepository = require('../../domain/repositories/IServiceRecordRepository');

class PrismaServiceRecordRepository extends IServiceRecordRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async create(data, tx) {
        const db = tx || this.prisma; // Sử dụng transaction nếu được cung cấp
        return db.serviceRecord.create({
            data: data,
        });
    }
    async findByTechnician(technicianId, status) {
        const whereClause = {
            technicianId: technicianId,
        };
        if (status) {
            whereClause.status = status;
        }
        return this.prisma.serviceRecord.findMany({
            where: whereClause,
            include: {
                appointment: {
                    include: {
                        customer: { select: { fullName: true } },
                        vehicle: { select: { make: true, model: true, licensePlate: true } }
                    }
                }
            },
            orderBy: {
                appointment: { appointmentDate: 'asc' }
            }
        });
    }

    async findById(recordId) {
        return this.prisma.serviceRecord.findUnique({
            where: { id: recordId }
        });
    }

    async findByAppointmentId(appointmentId) {
        return this.prisma.serviceRecord.findUnique({
            where: { appointmentId: appointmentId }
        });
    }

    async update(recordId, data, tx) {
        const db = tx || this.prisma;
        return db.serviceRecord.update({
            where: { id: recordId },
            data: data,
        });
    }
}

module.exports = PrismaServiceRecordRepository;