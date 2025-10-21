class IServiceCenterRepository {
    async getServiceCenterById(id) {
        throw new Error('Method not implemented');
    }
    async getAllServiceCenters() {
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