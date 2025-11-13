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
    async findByTechnician(technicianId, statusArray) { // (Đổi tên 'status' thành 'statusArray' cho rõ)
        const whereClause = {
            technicianId: technicianId,
        };
        
        // (SỬA LỖI LOGIC PRISMA)
        if (statusArray && statusArray.length > 0) {
            // Phải dùng 'in:' để Prisma lọc theo mảng
            whereClause.status = { in: statusArray }; 
        }

        return this.prisma.serviceRecord.findMany({
            where: whereClause, // Giờ whereClause sẽ đúng
            include: {
                appointment: {
                    include: {
                        customer: { select: { fullName: true } },
                        vehicle: { 
                            select: { 
                                licensePlate: true,
                                vehicleModel: {
                                    select: { brand: true, name: true }
                                }
                            }
                        },
                        requestedServices: {
                            include: {
                                serviceType: {
                                    select: { name: true }
                                }
                            }
                        }
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

    async findByCenterAndStatus(serviceCenterId, status) {
        return this.prisma.serviceRecord.findMany({
            where: {
                status: status,
                appointment: { 
                    serviceCenterId: serviceCenterId
                }
            },
            include: {
                appointment: {
                    include: {
                        customer: { select: { fullName: true } },
                        vehicle: { 
                            select: { 
                                licensePlate: true,
                                vehicleModel: {
                                    select: { brand: true, name: true }
                                }
                            }
                        }
                    }
                },
                partsUsed: { 
                    where: { status: 'REQUESTED' },
                    include: { part: true }
                },
                technician: { select: { fullName: true } }
            },
            orderBy: { appointment: { appointmentDate: 'asc' } }
        });
    }

    async getPerformanceByCenter(serviceCenterId, startDate, endDate) {
        const performance = await this.prisma.serviceRecord.groupBy({
            by: ['technicianId'], // Nhóm theo KTV
            _count: { id: true }, // Đếm số lượng record
            where: {
                status: 'COMPLETED',
                appointment: {
                    serviceCenterId: serviceCenterId
                },
                endTime: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
        const technicianIds = performance.map(p => p.technicianId);
        const technicians = await this.prisma.user.findMany({
            where: { id: { in: technicianIds } },
            select: { id: true, fullName: true, employeeCode: true }
        });

        // Kết hợp kết quả
        return performance.map(p => {
            const techInfo = technicians.find(t => t.id === p.technicianId);
            return {
                technicianId: p.technicianId,
                technicianName: techInfo?.fullName || 'N/A',
                employeeCode: techInfo?.employeeCode || 'N/A',
                completedJobs: p._count.id
            };
        });
    }
    async findBusyTechnicianIds(serviceCenterId, appointmentDate, tx) {
        const db = tx || this.prisma;
        
        const records = await db.serviceRecord.findMany({
            where: {
                status: { 
                    notIn: ['COMPLETED', 'CANCELLED'] // Bất kỳ trạng thái nào đang hoạt động
                },
                appointment: {
                    serviceCenterId: serviceCenterId,
                    appointmentDate: appointmentDate // Kiểm tra chính xác slot thời gian
                }
            },
            select: {
                technicianId: true
            }
        });

        // Trả về một mảng các ID unique
        return [...new Set(records.map(r => r.technicianId))];
    }
}


module.exports = PrismaServiceRecordRepository;