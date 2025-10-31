// Tệp: src/application/bookings/respondToQuotation.js
const { AppointmentStatus, ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');

class RespondToQuotation {
    constructor(appointmentRepository, serviceRecordRepository, partUsageRepository) { 
        this.appointmentRepo = appointmentRepository;
        this.serviceRecordRepo = serviceRecordRepository;
        this.partUsageRepo = partUsageRepository; 
    }

    async execute(appointmentId, customerId, didAccept) {
        const appointment = await this.appointmentRepo.findByIdAndCustomer(appointmentId, customerId);
        if (!appointment) { throw new Error('Appointment not found or you are not the owner.'); }
        if (appointment.status !== AppointmentStatus.PENDING_APPROVAL) { throw new Error('No quotation is awaiting your approval.'); }
        if (!appointment.serviceRecord) { throw new Error('Internal error: Service record not found.'); }

        const recordId = appointment.serviceRecord.id;
        let message = '';

        if (didAccept) {
            message = 'Quotation approved.';
            // Kiểm tra xem KTV có yêu cầu phụ tùng nào không (status=REQUESTED)
            const requestedParts = await this.partUsageRepo.findByServiceRecord(recordId, PartUsageStatus.REQUESTED);
            
            let nextRecordStatus;
            if (requestedParts.length > 0) {
                // Nếu CÓ, chuyển sang chờ IM xuất kho
                nextRecordStatus = ServiceRecordStatus.WAITING_PARTS;
                message += ' Service is now waiting for parts issuance.';
            } else {
                // Nếu KHÔNG, KTV vào việc sửa chữa ngay
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
            // Hủy luôn các PartUsage đã yêu cầu
            await this.partUsageRepo.updateStatusByRecordId(recordId, PartUsageStatus.CANCELLED);
        }
        return { message };
    }
}
module.exports = RespondToQuotation;