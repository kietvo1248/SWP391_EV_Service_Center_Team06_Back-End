// Tệp: src/infrastructure/repositories/PrismaVehicleRepository.js
const IVehicleRepository = require('../../domain/repositories/IVehicleRepository');

class PrismaVehicleRepository extends IVehicleRepository {
    constructor(prismaClient) {
        super();
        this.prisma = prismaClient;
    }

    /**
     * Hàm nội bộ để đính kèm thông tin Dòng xe và Pin
     */
    _getInclude() {
        return {
            vehicleModel: true, // Lấy thông tin Dòng xe (VF8, VF9)
            battery: true,      // Lấy thông tin Loại pin (90kWh)
        };
    }

    /**
     * (MỚI) Lấy danh sách Dòng xe (chỉ VinFast theo yêu cầu)
     */
    async listModels() {
        return this.prisma.vehicleModel.findMany({
            where: {
                brand: 'VinFast',
            },
        });
    }

    /**
     * Lấy danh sách Pin tương thích
     */
    async listCompatibleBatteries(modelId) {
        const model = await this.prisma.vehicleModel.findUnique({
            where: { id: modelId },
            include: { compatibleBatteries: true },
        });
        if (!model) {
            throw new Error('Vehicle model not found');
        }
        return model.compatibleBatteries;
    }

    /**
     * Tạo xe mới
     */
    async create(vehicleData) {
        return this.prisma.vehicle.create({
            data: vehicleData,
            include: this._getInclude(),
        });
    }

    /**
     *  Cập nhật chi tiết xe (chỉ 3 trường)
     */
    async update(vehicleId, updateData) {
        return this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: updateData, // Gồm: licensePlate, color, batteryId
            include: this._getInclude(),
        });
    }

    /**
     * Xóa mềm
     */
    async softDelete(vehicleId) {
        return this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                isDeleted: true,
            },
            include: this._getInclude(),
        });
    }

    /**
     * Tìm bằng VIN, chỉ tìm xe CHƯA XÓA
     */
    async findByVin(vin) {
        return this.prisma.vehicle.findFirst({
            where: { 
                vin: vin,
                isDeleted: false, // <-- Logic Xóa Mềm
            },
        });
    }

    /**
     *  Tìm bằng Biển số, chỉ tìm xe CHƯA XÓA
     */
    async findByLicensePlate(licensePlate) {
        if (!licensePlate) return null;
        return this.prisma.vehicle.findFirst({
            where: { 
                licensePlate: licensePlate,
                isDeleted: false, // <-- Logic Xóa Mềm
            },
        });
    }

    /**
     * Tìm bằng ID và Chủ sở hữu, chỉ tìm xe CHƯA XÓA
     */
    async findById(vehicleId, ownerId) {
        return this.prisma.vehicle.findFirst({
            where: {
                id: vehicleId,
                ownerId: ownerId,
                isDeleted: false, // <-- Logic Xóa Mềm
            },
            include: this._getInclude(),
        });
    }

    /**
     * Lấy danh sách xe của chủ sở hữu, chỉ lấy xe CHƯA XÓA
     */
    async findByOwner(ownerId) {
        return this.prisma.vehicle.findMany({
            where: {
                ownerId: ownerId,
                isDeleted: false, // <-- Logic Xóa Mềm
            },
            include: this._getInclude(),
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}

module.exports = PrismaVehicleRepository;