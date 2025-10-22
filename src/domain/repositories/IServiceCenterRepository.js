class IServiceCenterRepository {
    async getServiceCenterById(id) {
        throw new Error('Method not implemented');
    }
    async getAllServiceCenters() {
        throw new Error('Method not implemented');
    }
    /**
     * Lấy các khung giờ còn trống của một trung tâm theo ngày
     * @param {string} serviceCenterId
     * @param {Date} date - Ngày cần kiểm tra
     * @returns {Promise<Array>} Danh sách các slot
     */
    async getAvailableSlots(serviceCenterId, date) {
        throw new Error('Method not implemented');
    }

    async createServiceCenter(serviceCenterData) {
        throw new Error('Method not implemented');
    }
    async updateServiceCenter(id, updateData) {
        throw new Error('Method not implemented');
    }
    async deleteServiceCenter(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IServiceCenterRepository;