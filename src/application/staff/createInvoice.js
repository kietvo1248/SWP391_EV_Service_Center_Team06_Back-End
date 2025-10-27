const InvoiceEntity = require('../../domain/entities/Invoice');
const { Decimal } = require('@prisma/client/runtime/library');

class CreateInvoice {
    constructor(invoiceRepository, quotationRepository, serviceRecordRepository, appointmentRepository) {
        this.invoiceRepository = invoiceRepository; // Assign to this.invoiceRepository
        this.quotationRepository = quotationRepository;
        this.serviceRecordRepository = serviceRecordRepository;
        this.appointmentRepository = appointmentRepository;
    }

    async execute(serviceRecordId, staffServiceCenterId) {
        // ... (Logic kiểm tra record, appointment, quotation giữ nguyên) ...
        const record = await this.serviceRecordRepository.findById(serviceRecordId);
        if (!record) { throw new Error('Service record not found.'); }
        const appointment = await this.appointmentRepository.findById(record.appointmentId);
        if (!appointment || appointment.serviceCenterId !== staffServiceCenterId) { throw new Error('Record not found or not in your center.'); }
        const quotation = await this.quotationRepository.findByServiceRecordId(record.id);
        if (!quotation) { throw new Error('Quotation not found. Cannot create invoice.'); }
        
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const createdInvoicePrisma = await this.invoiceRepository.create({
            serviceRecordId: record.id,
            totalAmount: quotation.estimatedCost,
            status: 'UNPAID',
            issueDate: new Date(),
            dueDate: dueDate
        });

        // Trả về Invoice Entity
        return new InvoiceEntity(
            createdInvoicePrisma.id,
            createdInvoicePrisma.serviceRecordId,
            createdInvoicePrisma.totalAmount, // Prisma trả về Decimal
            createdInvoicePrisma.status,
            createdInvoicePrisma.issueDate,
            createdInvoicePrisma.dueDate
        );
    }
}
module.exports = CreateInvoice;