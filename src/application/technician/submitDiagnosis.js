// Tệp: src/application/technician/submitDiagnosis.js
const { Prisma, AppointmentStatus, ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');

class SubmitDiagnosis {
    // Sửa Constructor: Thêm 2 repo cho việc tính toán và tạo partUsage
    constructor(
        serviceRecordRepository, 
        quotationRepository, 
        appointmentRepository, 
        partRepository, // Thêm
        partUsageRepository, // Thêm
        prismaClient
    ) {
        this.serviceRecordRepo = serviceRecordRepository;
        this.quotationRepo = quotationRepository;
        this.appointmentRepo = appointmentRepository;
        this.partRepo = partRepository;
        this.partUsageRepo = partUsageRepository;
        this.prisma = prismaClient;
    }

    // KTV không gửi 'estimatedCost' nữa, chỉ gửi 'partUsages'
    async execute(serviceRecordId, actor, { diagnosisNotes, partUsages /* Xóa estimatedCost */ }) {
        
        // Bọc trong transaction để đảm bảo tính toàn vẹn
        return this.prisma.$transaction(async (tx) => {
            // Bước 1: Xác thực (Giữ logic cũ)
            const serviceRecord = await tx.serviceRecord.findUnique({
                where: { id: serviceRecordId },
                include: { appointment: true }
            });
            if (!serviceRecord || serviceRecord.technicianId !== actor.id) {
                throw new Error("Service record not found or you are not assigned.");
            }
            if (serviceRecord.status !== ServiceRecordStatus.DIAGNOSING) {
                throw new Error("Service record is not in diagnosing status.");
            }

            // --- SỬA LỖI LOGIC TÀI CHÍNH ---
            let totalPartCost = 0;
            const createdPartUsages = [];

            if (partUsages && partUsages.length > 0) {
                // Lấy ID của tất cả các part
                const partIds = partUsages.map(p => p.partId);
                
                // Lấy giá của chúng từ CSDL
                const partsFromDb = await tx.part.findMany({
                    where: { id: { in: partIds } }
                });

                // Map giá vào
                for (const requestedPart of partUsages) {
                    const partInfo = partsFromDb.find(p => p.id === requestedPart.partId);
                    if (!partInfo) {
                        throw new Error(`Part ID ${requestedPart.partId} not found.`);
                    }

                    // Tính toán chi phí
                    const unitPrice = partInfo.price;
                    const quantity = requestedPart.quantity;
                    totalPartCost += (Number(unitPrice) * quantity);

                    // Tạo bản ghi PartUsage (chờ xuất kho)
                    const newUsage = await tx.partUsage.create({
                        data: {
                            serviceRecordId: serviceRecordId,
                            partId: partInfo.id,
                            quantity: quantity,
                            unitPrice: unitPrice, // Lưu giá tại thời điểm báo giá
                            status: PartUsageStatus.REQUESTED
                        }
                    });
                    createdPartUsages.push(newUsage);
                }
            }
            
            // Hiện tại, estimatedCost = tổng tiền phụ tùng
            const estimatedCost = totalPartCost;

            // Bước 3: Tạo Báo giá (Quotation) với chi phí ĐÃ TÍNH TOÁN
            const newQuotation = await tx.quotation.create({
                data: {
                    serviceRecordId: serviceRecordId,
                    estimatedCost: estimatedCost, // Sử dụng chi phí hệ thống tự tính
                }
            });

            // Bước 4: Cập nhật trạng thái
            await tx.serviceRecord.update({
                where: { id: serviceRecordId },
                data: { 
                    status: ServiceRecordStatus.WAITING_APPROVAL,
                    staffNotes: diagnosisNotes
                }
            });
            const updatedAppointment = await tx.serviceAppointment.update({
                where: { id: serviceRecord.appointmentId },
                data: { status: AppointmentStatus.PENDING_APPROVAL }
            });

            return { appointment: updatedAppointment, quotation: newQuotation };
        });
    }
}

module.exports = SubmitDiagnosis;