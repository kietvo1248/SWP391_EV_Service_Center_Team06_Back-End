class ListCenterTechnicians {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(serviceCenterId) {
        if (!serviceCenterId) {
            throw new Error('Service center ID is required.');
        }
        return this.userRepository.findTechniciansByCenter(serviceCenterId);
    }
}
module.exports = ListCenterTechnicians;