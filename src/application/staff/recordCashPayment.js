const InvoiceEntity = require('../../domain/entities/Invoice');
const PaymentEntity = require('../../domain/entities/Payment'); // Chỉ cần nếu muốn trả về Payment

class RecordCashPayment {
    constructor(invoiceRepo, paymentRepo, prismaClient) {
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.prisma = prismaClient;
    }

    async execute(invoiceId) {
        let updatedInvoicePrisma;
        // let createdPaymentPrisma; // Không cần lưu nếu chỉ trả về Invoice

        await this.prisma.$transaction(async (tx) => {
            // TODO: Kiểm tra Invoice tồn tại và thuộc trung tâm

            // 1. Cập nhật Invoice -> PAID
            updatedInvoicePrisma = await this.invoiceRepo.updateStatus(invoiceId, 'PAID', tx);

            // 2. Tạo bản ghi Payment
            /* createdPaymentPrisma = dẹp */
            await this.paymentRepo.create({
                invoiceId: invoiceId,
                paymentMethod: 'CASH',
                status: 'SUCCESSFUL',
                paymentDate: new Date()
            }, tx);
        });

        // Trả về Invoice Entity đã cập nhật
        return new InvoiceEntity(
            updatedInvoicePrisma.id,
            updatedInvoicePrisma.serviceRecordId,
            updatedInvoicePrisma.totalAmount,
            updatedInvoicePrisma.status,
            updatedInvoicePrisma.issueDate,
            updatedInvoicePrisma.dueDate
        );
    }
}
module.exports = RecordCashPayment;