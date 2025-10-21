const IAppointmentRepository = require('../../domain/repositories/IAppointmentRepository');

class PrismaAppointmentRepository extends IAppointmentRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    /**
     * Nâng cấp hàm 'add' để sử dụng transaction
     * Lưu ServiceAppointment và AppointmentService cùng lúc
     * @param {object} appointmentData - Dữ liệu từ domain entity
     * @param {string[]} requestedServices - Mảng các ID của ServiceType
     */
    async add(appointmentData, requestedServices = []) {
        
        // Dùng $transaction để đảm bảo cả hai thao tác cùng thành công hoặc thất bại
        return this.prisma.$transaction(async (tx) => {
            
            // 1. Tạo lịch hẹn chính
            const newAppointment = await tx.serviceAppointment.create({
                data: {
                    customerId: appointmentData.customerId,
                    vehicleId: appointmentData.vehicleId,
                    serviceCenterId: appointmentData.serviceCenterId,
                    appointmentDate: appointmentData.appointmentDate,
                    status: appointmentData.status,
                    customerNotes: appointmentData.customerNotes,
                },
            });

            // 2. Nếu có dịch vụ được yêu cầu, liên kết chúng
            if (requestedServices && requestedServices.length > 0) {
                const servicesToLink = requestedServices.map(serviceTypeId => ({
                    appointmentId: newAppointment.id,
                    serviceTypeId: serviceTypeId,
                }));

                await tx.appointmentService.createMany({
                    data: servicesToLink,
                });
            }

            // 3. Trả về lịch hẹn vừa tạo
            return newAppointment;
        });
    }
}

module.exports = PrismaAppointmentRepository;