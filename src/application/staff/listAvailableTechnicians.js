// Tệp: src/application/staff/listAvailableTechnicians.js
const { Role } = require('@prisma/client');

class ListAvailableTechnicians {
    constructor(userRepository, serviceRecordRepository) {
        this.userRepo = userRepository;
        this.serviceRecordRepo = serviceRecordRepository;
    }

    async execute(actor, appointmentDateStr) {
        if (![Role.STAFF, Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) {
            throw new Error('Forbidden: Access denied.');
        }
        if (!actor.serviceCenterId) {
            throw new Error('Actor is not assigned to a service center.');
        }

        const appointmentDate = new Date(appointmentDateStr);
        if (isNaN(appointmentDate.getTime())) {
            throw new Error('Invalid appointmentDate format. ISO 8601 string is required.');
        }

        const serviceCenterId = actor.serviceCenterId;

        // 1. Lấy TẤT CẢ KTV tại trạm
        const allTechnicians = await this.userRepo.findTechniciansByCenter(serviceCenterId);
        
        // 2. Lấy danh sách ID của KTV ĐÃ BẬN vào giờ đó
        const busyTechnicianIds = await this.serviceRecordRepo.findBusyTechnicianIds(
            serviceCenterId,
            appointmentDate
        );

        // 3. Lọc ra những KTV rảnh
        const availableTechnicians = allTechnicians.filter(tech => 
            !busyTechnicianIds.includes(tech.id)
        );

        return availableTechnicians;
    }
}

module.exports = ListAvailableTechnicians;