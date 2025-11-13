// Tệp: src/application/staff/createInvoice.js
const InvoiceEntity = require('../../domain/entities/Invoice');
const { Decimal } = require('@prisma/client/runtime/library');

class CreateInvoice {
    constructor(
        invoiceRepository, 
        // quotationRepository, // (XÓA BỎ)
        serviceRecordRepository, 
        appointmentRepository,
        prismaClient // (THÊM MỚI) - Để truy vấn lồng nhau
    ) {
        this.invoiceRepository = invoiceRepository;
        this.serviceRecordRepository = serviceRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.prisma = prismaClient; // (THÊM MỚI)
    }

    async execute(serviceRecordId, staffServiceCenterId) {
        // 1. Kiểm tra Record và Appointment (Logic cũ vẫn đúng)
        const record = await this.serviceRecordRepository.findById(serviceRecordId);
        if (!record) { throw new Error('Service record not found.'); }
        
        // (SỬA) Dùng prisma để lấy dữ liệu lồng nhau
        const appointment = await this.prisma.serviceAppointment.findUnique({
            where: { id: record.appointmentId },
            include: {
                requestedServices: { // Lấy các dịch vụ đã đăng ký (gói)
                    include: {
                        serviceType: { // Lấy chi tiết gói (để lấy giá)
                            select: { price: true }
                        }
                    }
                }
            }
        });
        
        if (!appointment || appointment.serviceCenterId !== staffServiceCenterId) { 
            throw new Error('Record not found or not in your center.'); 
        }
        
        // 2. (LOGIC MỚI) Tính toán TotalAmount
        let totalAmount = new Decimal(0);

        // 2a. Cộng giá gói dịch vụ
        // Giả định rằng luồng mới chỉ cho phép 1 gói dịch vụ (requestedServices[0])
        if (appointment.requestedServices && appointment.requestedServices[0] && appointment.requestedServices[0].serviceType) {
            const servicePrice = appointment.requestedServices[0].serviceType.price;
            if (servicePrice) {
                totalAmount = totalAmount.plus(new Decimal(servicePrice));
            }
        } else {
            throw new Error('Service package (ServiceType) not found for this appointment. Cannot calculate price.');
        }

        // 2b. Cộng giá phụ tùng đã sử dụng (ISSUED)
        const partsUsed = await this.prisma.partUsage.findMany({
            where: {
                serviceRecordId: record.id,
                status: 'ISSUED' // Chỉ tính các phụ tùng đã thực sự xuất kho
            }
        });

        if (partsUsed.length > 0) {
            const totalPartsCost = partsUsed.reduce((sum, part) => {
                const partCost = new Decimal(part.unitPrice).times(part.quantity);
                return sum.plus(partCost);
            }, new Decimal(0));
            
            totalAmount = totalAmount.plus(totalPartsCost);
        }
        
        // 3. Tạo Hóa đơn (Logic cũ vẫn đúng)
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const createdInvoicePrisma = await this.invoiceRepository.create({
            serviceRecordId: record.id,
            totalAmount: totalAmount, // (SỬA) Dùng totalAmount đã tính toán
            status: 'UNPAID',
            issueDate: new Date(),
            dueDate: dueDate
        });

        // 4. Trả về Entity (Logic cũ vẫn đúng)
        return new InvoiceEntity(
            createdInvoicePrisma.id,
            createdInvoicePrisma.serviceRecordId,
            createdInvoicePrisma.totalAmount,
            createdInvoicePrisma.status,
            createdInvoicePrisma.issueDate,
            createdInvoicePrisma.dueDate
        );
    }
}
module.exports = CreateInvoice;