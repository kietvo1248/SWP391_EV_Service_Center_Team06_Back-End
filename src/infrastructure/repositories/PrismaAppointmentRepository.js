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
    async findByCenterId(serviceCenterId, status) {
        const whereClause = {
            serviceCenterId: serviceCenterId,
        };

        if (status) {
            whereClause.status = status;
        }

        return this.prisma.serviceAppointment.findMany({
            where: whereClause,
            select: {
                id: true,
                appointmentDate: true,
                status: true,
                customer: { // Lấy thông tin khách hàng
                    select: { fullName: true, phoneNumber: true }
                },
                vehicle: { // Lấy thông tin xe
                    select: { make: true, model: true, licensePlate: true }
                }
            },
            orderBy: {
                appointmentDate: 'asc', // Sắp xếp theo ngày hẹn
            }
        });
    }

    async findById(appointmentId) {
        return this.prisma.serviceAppointment.findUnique({
            where: { id: appointmentId },
            include: {
                customer: { // Thông tin khách hàng
                    select: { id: true, fullName: true, email: true, phoneNumber: true }
                },
                vehicle: true, // Lấy tất cả thông tin xe
                serviceCenter: { // Thông tin trung tâm
                    select: { id: true, name: true, address: true }
                },
                requestedServices: { // Dịch vụ đã yêu cầu
                    include: {
                        serviceType: true // Lấy chi tiết của loại dịch vụ
                    }
                }
            }
        });
    }

    async updateStatus(appointmentId, status, tx) {
        const db = tx || this.prisma; // Sử dụng transaction nếu được cung cấp
        return db.serviceAppointment.update({
            where: { id: appointmentId },
            data: { status: status },
        });
    }

    //tìm kiếm cho khách cho nhân viên
    async findConfirmedByCustomerPhone(serviceCenterId, phone) {
        return this.prisma.serviceAppointment.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                status: 'CONFIRMED', // Chỉ tìm lịch đã xác nhận
                customer: {
                    phoneNumber: {
                        contains: phone, // Tìm kiếm SĐT
                    }
                }
            },
            include: {
                customer: { select: { fullName: true, email: true, phoneNumber: true } },
                vehicle: { select: { make: true, model: true, licensePlate: true } }
            },
            orderBy: {
                appointmentDate: 'asc'
            }
        });
    }

    async findByIdAndCustomer(appointmentId, customerId) {
        return this.prisma.serviceAppointment.findFirst({
            where: {
                id: appointmentId,
                customerId: customerId,
            },
            include: {
                vehicle: true,
                serviceCenter: { select: { name: true } },
                requestedServices: { include: { serviceType: true } },
                serviceRecord: { // Lấy báo giá liên quan
                    include: {
                        quotation: true
                    }
                }
            }
        });
    }
}

module.exports = PrismaAppointmentRepository;