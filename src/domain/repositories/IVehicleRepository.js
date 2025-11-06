class IVehicleRepository {
    /**
     * Lấy danh sách Dòng xe (vd: VF8, VF9)
     * @returns {Promise<VehicleModel[]>}
     */
    async listModels() {
        throw new Error('Method not implemented');
    }

    /**
     * Lấy danh sách Pin tương thích với một Dòng xe
     * @param {string} modelId 
     * @returns {Promise<BatteryType[]>}
     */
    async listCompatibleBatteries(modelId) {
        throw new Error('Method not implemented');
    }

    /**
     * Tạo xe mới
     * @param {object} vehicleData 
     * @returns {Promise<Vehicle>}
     */
    async create(vehicleData) {
        throw new Error('Method not implemented');
    }

    /**
     * Cập nhật chi tiết xe (chỉ 3 trường)
     * @param {string} vehicleId 
     * @param {object} updateData 
     * @returns {Promise<Vehicle>}
     */
    async update(vehicleId, updateData) {
        throw new Error('Method not implemented');
    }

    /**
     * Xóa mềm một chiếc xe
     * @param {string} vehicleId 
     * @returns {Promise<Vehicle>}
     */
    async softDelete(vehicleId) {
        throw new Error('Method not implemented');
    }

    /**
     * Tìm xe (chưa xóa) bằng VIN
     * @param {string} vin 
     * @returns {Promise<Vehicle | null>}
     */
    async findByVin(vin) {
        throw new Error('Method not implemented');
    }

    /**
     * Tìm xe (chưa xóa) bằng Biển số
     * @param {string} licensePlate 
     * @returns {Promise<Vehicle | null>}
     */
    async findByLicensePlate(licensePlate) {
        throw new Error('Method not implemented');
    }

    /**
     * Tìm xe (chưa xóa) bằng ID và chủ sở hữu
     * @param {string} vehicleId 
     * @param {string} ownerId 
     * @returns {Promise<Vehicle | null>}
     */
    async findById(vehicleId, ownerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Lấy danh sách xe (chưa xóa) của chủ sở hữu
     * @param {string} ownerId 
     * @returns {Promise<Vehicle[]>}
     */
    async findByOwner(ownerId) { // Đổi tên từ findByOwnerId
        throw new Error('Method not implemented');
    }
}

module.exports = IVehicleRepository;