class RespondToQuotation {
    constructor(appointmentRepo, serviceRecordRepo, prismaClient) {
        this.appointmentRepo = appointmentRepo;
        this.serviceRecordRepo = serviceRecordRepo;
        this.prisma = prismaClient;
    }

    async execute(appointmentId, customerId, didAccept) {
        // ... (Logic kiểm tra appointment và trạng thái giữ nguyên) ...
        const appointment = await this.appointmentRepo.findByIdAndCustomer(appointmentId, customerId);
        if (!appointment) { throw new Error('Appointment not found or you are not the owner.'); }
        if (appointment.status !== 'PENDING_APPROVAL') { throw new Error('No quotation is awaiting your approval.'); }
        if (!appointment.serviceRecord) { throw new Error('Internal error: Service record not found for this appointment.'); }


        let message = '';
        await this.prisma.$transaction(async (tx) => {
            if (didAccept) {
                await this.appointmentRepo.updateStatus(appointmentId, 'IN_PROGRESS', tx);
                await this.serviceRecordRepo.update(appointment.serviceRecord.id, { status: 'IN_PROGRESS' }, tx);
                message = 'Quotation approved. Repair will proceed.';
            } else {
                await this.appointmentRepo.updateStatus(appointmentId, 'CANCELLED', tx);
                await this.serviceRecordRepo.update(appointment.serviceRecord.id, { status: 'CANCELLED' }, tx);
                message = 'Quotation rejected. Appointment has been cancelled.';
            }
        });
        return { message }; // Chỉ trả về thông báo
    }
}
module.exports = RespondToQuotation;