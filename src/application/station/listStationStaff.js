// Tệp: src/application/station/listStationStaff.js
const { Role } = require('@prisma/client');
class ListStationStaff {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(actor) {
        if (![Role.STATION_ADMIN, Role.ADMIN].includes(actor.role)) throw new Error("Forbidden.");
        if (!actor.serviceCenterId) throw new Error("Actor is not assigned to a center.");
        return this.userRepository.findStaffByCenter(actor.serviceCenterId);
    }
}
module.exports = ListStationStaff;