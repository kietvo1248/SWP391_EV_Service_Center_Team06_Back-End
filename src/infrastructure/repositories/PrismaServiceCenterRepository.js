// Tệp: src/infrastructure/repositories/PrismaServiceCenterRepository.js

const IServiceCenterRepository = require('../../domain/repositories/IServiceCenterRepository');

class PrismaServiceCenterRepository extends IServiceCenterRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    /**
     * Lấy tất cả các trung tâm dịch vụ
     * @returns {Promise<Array>} Danh sách các trung tâm
     */
    async getAllServiceCenters() {
        return this.prisma.serviceCenter.findMany({
            // Chúng ta chỉ chọn các trường cần thiết cho danh sách
            select: {
                id: true,
                name: true,
                address: true,
                phoneNumber: true,
                openingTime: true,
                closingTime: true
            }
        });
    }

    /**
     * Lấy chi tiết một trung tâm bằng ID (sẽ dùng cho bước sau)
     * @param {string} id
     * @returns {Promise<Object>} Chi tiết trung tâm
     */
    async getServiceCenterById(id) {
        return this.prisma.serviceCenter.findUnique({
            where: { id: id },
        });
    }
    async getAvailableSlots(serviceCenterId, date) {
        // 1. Lấy thông tin cấu hình của trung tâm
        const center = await this.prisma.serviceCenter.findUnique({
            where: { id: serviceCenterId },
            select: {
                openingTime: true,
                closingTime: true,
                slotDurationMinutes: true,
                capacityPerSlot: true,
            },
        });

        if (!center) {
            throw new Error('Service center not found.');
        }

        // 2. Tính toán thời gian bắt đầu và kết thúc của ngày được chọn
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0); // Bắt đầu ngày

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày

        // 3. Lấy tất cả các lịch hẹn đã có trong ngày đó tại trung tâm
        const existingAppointments = await this.prisma.serviceAppointment.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                appointmentDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
                },
            },
            select: {
                appointmentDate: true,
            },
        });

        // 4. Đếm số lượng cho mỗi slot đã bị chiếm
        // (ví dụ: { '2025-10-23T09:00:00.000Z': 2, '2025-10-23T10:00:00.000Z': 1 })
        const appointmentCounts = existingAppointments.reduce((acc, appt) => {
            const timeString = appt.appointmentDate.toISOString();
            acc[timeString] = (acc[timeString] || 0) + 1;
            return acc;
        }, {});

        // 5. Tạo danh sách tất cả các slot có thể có trong ngày
        const availableSlots = [];
        const { openingTime, closingTime, slotDurationMinutes, capacityPerSlot } = center;

        // Chuyển '08:00' thành 8 và 0
        const [openHour, openMinute] = openingTime.split(':').map(Number);
        const [closeHour, closeMinute] = closingTime.split(':').map(Number);

        // Tạo một đối tượng Date để lặp
        const currentSlotTime = new Date(startDate);
        currentSlotTime.setHours(openHour, openMinute, 0, 0);

        // Tạo thời gian đóng cửa để so sánh
        const closingDateTime = new Date(startDate);
        closingDateTime.setHours(closeHour, closeMinute, 0, 0);

        // Lặp từ giờ mở cửa đến giờ đóng cửa
        while (currentSlotTime < closingDateTime) {
            const slotISOString = currentSlotTime.toISOString();
            const count = appointmentCounts[slotISOString] || 0;
            
            availableSlots.push({
                time: slotISOString, 
                available: count < capacityPerSlot,
            });

            // + thời gian lên cho slot tiếp theo
            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + slotDurationMinutes);
        }

        return availableSlots;
    }

    // Các phương thức khác (create, update, delete) có thể được triển khai sau nếu cần
}

module.exports = PrismaServiceCenterRepository;