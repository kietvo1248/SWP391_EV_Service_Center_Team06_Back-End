const IServiceCenterRepository = require('../../domain/repositories/IServiceCenterRepository');

class PrismaServiceCenterRepository extends IServiceCenterRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async getServiceCenterById(id) {
        return this.prisma.serviceCenter.findUnique({ where: { id } });
    }

    async getAllServiceCenters() {
        return this.prisma.serviceCenter.findMany();
    }

    async getAvailableSlots(serviceCenterId, dateString) {
        const center = await this.prisma.serviceCenter.findUnique({
            where: { id: serviceCenterId },
        });

        if (!center) {
            throw new Error('Service center not found.');
        }

        const { openingTime, closingTime, slotDurationMinutes, capacityPerSlot } = center;

        const targetDate = new Date(dateString);
        if (isNaN(targetDate.getTime())) {
            throw new Error('Invalid date provided.');
        }

        const slots = [];
        const startHour = parseInt(openingTime.split(':')[0]);
        const endHour = parseInt(closingTime.split(':')[0]);

        let currentTime = new Date(targetDate);
        currentTime.setHours(startHour, 0, 0, 0);

        const closingTimeDate = new Date(targetDate);
        closingTimeDate.setHours(endHour, 0, 0, 0);

        while (currentTime < closingTimeDate) {
            slots.push({
                time: new Date(currentTime),
                available: true, // Default to true
            });
            currentTime.setMinutes(currentTime.getMinutes() + slotDurationMinutes);
        }

        // Fetch existing appointments for this center and date
        const bookedAppointments = await this.prisma.serviceAppointment.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                appointmentDate: {
                    gte: new Date(targetDate.setHours(0, 0, 0, 0)), // Start of the day
                    lt: new Date(targetDate.setHours(23, 59, 59, 999)), // End of the day
                },
                status: {
                    in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'], // Only consider active appointments
                },
            },
            select: {
                appointmentDate: true,
            },
        });

        // Count appointments per slot
        const slotCounts = new Map();
        bookedAppointments.forEach(appt => {
            const apptTimeKey = new Date(appt.appointmentDate).toISOString(); // Use ISO string for consistent key
            slotCounts.set(apptTimeKey, (slotCounts.get(apptTimeKey) || 0) + 1);
        });

        // Update availability based on capacity
        return slots.map(slot => {
            const slotKey = slot.time.toISOString();
            const count = slotCounts.get(slotKey) || 0;
            return {
                ...slot,
                available: count < capacityPerSlot,
            };
        });
    }

    async createServiceCenter(serviceCenterData) {
        return this.prisma.serviceCenter.create({ data: serviceCenterData });
    }
    async updateServiceCenter(id, updateData) {
        return this.prisma.serviceCenter.update({ where: { id }, data: updateData });
    }
    async deleteServiceCenter(id) {
        return this.prisma.serviceCenter.delete({ where: { id } });
    }
}

module.exports = PrismaServiceCenterRepository;