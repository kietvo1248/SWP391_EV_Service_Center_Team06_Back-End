// Tệp: src/application/bookings/respondToQuotation.js
const { AppointmentStatus, ServiceRecordStatus, PartUsageStatus } = require('@prisma/client');

class RespondToQuotation {
    // Sửa Constructor: Quay lại sử dụng partUsageRepo
    constructor(appointmentRepository, serviceRecordRepository, partUsageRepository) { 
        this.appointmentRepo = appointmentRepository;
        this.serviceRecordRepo = serviceRecordRepository;
        this.partUsageRepo = partUsageRepository; // Đã sửa
    }

    async execute(appointmentId, customerId, didAccept) {
        const appointment = await this.appointmentRepo.findByIdAndCustomer(appointmentId, customerId);
        // ... (validation giữ nguyên) ...
        if (!appointment || appointment.status !== AppointmentStatus.PENDING_APPROVAL) { 
            throw new Error('Appointment not found or no quotation awaiting approval.'); 
        }
        if (!appointment.serviceRecord) { throw new Error('Internal error: Service record not found.'); }

        const recordId = appointment.serviceRecord.id;
        let message = '';

        if (didAccept) {
            message = 'Quotation approved.';
            
            // Dùng repo để tìm
            const requestedParts = await this.partUsageRepo.findByServiceRecord(recordId, PartUsageStatus.REQUESTED);
            
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
            
            // --- SỬA LỖI ---
            // Gọi hàm 'updateStatusByRecordId' đã được định nghĩa trong Interface
            await this.partUsageRepo.updateStatusByRecordId(
                recordId, 
                PartUsageStatus.CANCELLED,    // Trạng thái mới
                PartUsageStatus.REQUESTED     // Chỉ hủy những cái đang REQUESTED
            );
            // --- KẾT THÚC SỬA LỖI ---
        }
        return { message };
    }
}
module.exports = RespondToQuotation;