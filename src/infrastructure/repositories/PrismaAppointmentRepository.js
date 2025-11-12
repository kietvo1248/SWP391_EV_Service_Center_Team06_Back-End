// Tệp: src/infrastructure/repositories/PrismaAppointmentRepository.js
const IAppointmentRepository = require('../../domain/repositories/IAppointmentRepository');

class PrismaAppointmentRepository extends IAppointmentRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    async add(appointmentData, requestedServices = []) {
        // (Logic 'add' của bạn đã đúng, giữ nguyên)
        return this.prisma.$transaction(async (tx) => {
            // ... (Logic tạo appointment và appointmentService) ...
            // (Không thay đổi)
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
            if (requestedServices && requestedServices.length > 0) {
                const servicesToLink = requestedServices.map(serviceTypeId => ({
                    appointmentId: newAppointment.id,
                    serviceTypeId: serviceTypeId,
                }));
                await tx.appointmentService.createMany({
                    data: servicesToLink,
                });
            }
            return newAppointment;
        });
    }

    /**
     * Dùng cho /api/staff/appointments
     */
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
                vehicle: {
                    select: { 
                        licensePlate: true,
                        vehicleModel: { // Lồng vào VehicleModel
                            select: {
                                brand: true, // Trường mới
                                name: true   // Trường mới (thay cho model)
                            }
                        }
                    }
                }
            },
            orderBy: {
                appointmentDate: 'asc',
            }
        });
    }

    /**
     * Dùng cho /api/appointments/:id
     */
    async findById(appointmentId) {
        return this.prisma.serviceAppointment.findUnique({
            where: { id: appointmentId },
            include: {
                customer: { // Thông tin khách hàng
                    select: { id: true, fullName: true, email: true, phoneNumber: true }
                },
                vehicle: {
                    include: {
                        vehicleModel: true, // Lấy VehicleModel (chứa brand, name)
                        battery: true     // Lấy BatteryType (chứa capacityKwh)
                    }
                },
                serviceCenter: { // Thông tin trung tâm
                    select: { id: true, name: true, address: true }
                },
                requestedServices: { // Dịch vụ đã yêu cầu
                    include: {
                        serviceType: true // Lấy chi tiết của loại dịch vụ
                    }
                },
                serviceRecord: { // (Giữ nguyên)
                    include: {
                        quotation: true
                    }
                }
            }
        });
    }

    async updateStatus(appointmentId, status, tx) {
        const db = tx || this.prisma;
        return db.serviceAppointment.update({
            where: { id: appointmentId },
            data: { status: status },
        });
    }

    /**
     * Dùng cho /api/staff/appointments/search
     */
    async findConfirmedByCustomerPhone(serviceCenterId, phone) {
        return this.prisma.serviceAppointment.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                status: 'CONFIRMED', 
                customer: {
                    phoneNumber: {
                        contains: phone, 
                    }
                }
            },
            include: {
                customer: { select: { fullName: true, email: true, phoneNumber: true } },
                vehicle: {
                    select: {
                        licensePlate: true,
                        vehicleModel: {
                            select: {
                                brand: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                appointmentDate: 'asc'
            }
        });
    }

    /**
     * Dùng cho /api/appointments/:id (khi Customer gọi)
     */
    async findByIdAndCustomer(appointmentId, customerId) {
        return this.prisma.serviceAppointment.findFirst({
            where: {
                id: appointmentId,
                customerId: customerId,
            },
            include: {
                vehicle: { 
                    include: {
                        vehicleModel: true,
                        battery: true
                    }
                },
                serviceCenter: { select: { name: true } },
                requestedServices: { include: { serviceType: true } },
                serviceRecord: { 
                    include: {
                        quotation: true
                    }
                }
            }
        });
    }
    
    /**
     * Dùng cho /api/appointments/history
     */
    async findByCustomerId(customerId, statuses = []) {
        const whereClause = {
            customerId: customerId,
        };

        if (statuses.length > 0) {
            whereClause.status = { in: statuses };
        }

        return this.prisma.serviceAppointment.findMany({
            where: whereClause,
            select: { 
                id: true,
                appointmentDate: true,
                status: true,
                vehicle: { 
                    select: { 
                        licensePlate: true,
                        vehicleModel: {
                            select: {
                                brand: true,
                                name: true
                            }
                        }
                    } 
                },
                serviceCenter: { select: { name: true } },
                requestedServices: { 
                    take: 1,
                    include: { 
                        serviceType: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                appointmentDate: 'desc', 
            }
        });
    }
}

module.exports = PrismaAppointmentRepository;