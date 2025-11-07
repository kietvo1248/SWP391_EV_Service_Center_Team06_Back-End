// Tệp: src/application/bookings/respondToQuotation.js
const { AppointmentStatus, ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');

class RespondToQuotation {
    constructor(appointmentRepository, serviceRecordRepository, prisma) { 
        this.appointmentRepo = appointmentRepository;
        this.serviceRecordRepo = serviceRecordRepository;
        this.prisma = prisma; // Sử dụng prisma client
    }

    async execute(appointmentId, customerId, didAccept) {
        // (Logic kiểm tra appointment giữ nguyên)
        const appointment = await this.appointmentRepo.findByIdAndCustomer(appointmentId, customerId);
        if (!appointment) { throw new Error('Appointment not found or you are not the owner.'); }
        if (appointment.status !== AppointmentStatus.PENDING_APPROVAL) { throw new Error('No quotation is awaiting your approval.'); }
        if (!appointment.serviceRecord) { throw new Error('Internal error: Service record not found.'); }

        const recordId = appointment.serviceRecord.id;
        let message = '';

        if (didAccept) {
            message = 'Quotation approved.';
            
            //  (Logic): Dùng prisma để tìm requestedParts ---
            // (partUsageRepo không còn ở đây)
            const requestedParts = await this.prisma.partUsage.findMany({
                where: { 
                    serviceRecordId: recordId, 
                    status: PartUsageStatus.REQUESTED 
                }
            });
        
            let nextRecordStatus;
            if (requestedParts.length > 0) {
                nextRecordStatus = ServiceRecordStatus.WAITING_PARTS;
                message += ' Service is now waiting for parts issuance.';
            } else {
                nextRecordStatus = ServiceRecordStatus.REPAIRING;
                message += ' Repair will proceed.';
            }
            
            await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.IN_PROGRESS);
            await this.serviceRecordRepo.update(recordId, { status: nextRecordStatus });

        } else {
            // Khách từ chối
            message = 'Quotation rejected. Appointment has been cancelled.';
            await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.CANCELLED);
            await this.serviceRecordRepo.update(recordId, { status: ServiceRecordStatus.CANCELLED });
            
            await this.prisma.partUsage.updateMany({
                where: {
                    serviceRecordId: recordId,
                    status: PartUsageStatus.REQUESTED // Chỉ hủy những cái đang chờ
                },
                data: {
                    status: PartUsageStatus.CANCELLED
                }
            });
        }
        return { message };
    }
}
module.exports = RespondToQuotation;