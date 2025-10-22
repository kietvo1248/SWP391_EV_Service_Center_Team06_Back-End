class GetAvailableSlots {
    constructor(serviceCenterRepository) {
        this.serviceCenterRepository = serviceCenterRepository;
    }

    async execute(serviceCenterId, dateString) {
        // 1. Xác thực đầu vào
        if (!serviceCenterId) {
            throw new Error('Service center ID is required.');
        }
        if (!dateString) {
            throw new Error('Date is required.');
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format. Please use YYYY-MM-DD.');
        }

        // 2. Gọi repository
        return this.serviceCenterRepository.getAvailableSlots(serviceCenterId, date);
    }
}

module.exports = GetAvailableSlots;