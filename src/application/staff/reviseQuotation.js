const { Prisma, AppointmentStatus, ServiceRecordStatus } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

class ReviseQuotation {
    constructor(quotationRepo, appointmentRepo, serviceRecordRepo, prismaClient) {
        this.quotationRepo = quotationRepo;
        this.appointmentRepo = appointmentRepo;
        this.serviceRecordRepo = serviceRecordRepo;
        this.prisma = prismaClient;
    }

    async execute(quotationId, newData, actor) {
        const { estimatedCost } = newData;

        if (!estimatedCost || estimatedCost <= 0) {
            throw new Error('New estimated cost must be a positive number.');
        }

        let updatedAppointment;

        await this.prisma.$transaction(async (tx) => {
            // 1. Tìm báo giá và kiểm tra quyền
            const quotation = await this.quotationRepo.findById(quotationId);
            if (!quotation) {
                throw new Error('Quotation not found.');
            }
            
            const appointment = quotation.serviceRecord.appointment;
            
            // Kiểm tra quyền của Staff/Admin
            if (appointment.serviceCenterId !== actor.serviceCenterId && actor.role !== 'ADMIN') {
                throw new Error('Forbidden. Quotation is not in your center.');
            }

            // 2. Chỉ cho phép sửa khi đang chờ duyệt hoặc đã bị hủy (sau khi khách từ chối)
            if (![AppointmentStatus.PENDING_APPROVAL, AppointmentStatus.CANCELLED].includes(appointment.status)) {
                throw new Error(`Cannot revise quotation. Appointment status is ${appointment.status}.`);
            }

            // 3. Cập nhật báo giá
            await this.quotationRepo.update(quotationId, {
                estimatedCost: new Prisma.Decimal(estimatedCost),
            }, tx);
            
            // 4. Cập nhật ServiceRecord (nếu đang bị hủy)
            if(quotation.serviceRecord.status === ServiceRecordStatus.CANCELLED) {
                await this.serviceRecordRepo.update(quotation.serviceRecordId, {
                    status: ServiceRecordStatus.WAITING_APPROVAL 
                }, tx);
            }

            // 5. Chuyển trạng thái Appointment về PENDING_APPROVAL
            updatedAppointment = await this.appointmentRepo.updateStatus(appointment.id, AppointmentStatus.PENDING_APPROVAL, tx);

        });

        return updatedAppointment; // Trả về lịch hẹn đã cập nhật
    }
}
module.exports = ReviseQuotation;