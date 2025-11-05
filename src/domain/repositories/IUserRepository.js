// Interface này định nghĩa các phương thức mà tầng Application cần để thao tác với User
class IUserRepository {
    async findByEmail(email) {
        throw new Error('Method not implemented');
    }

    async create(user) {
        throw new Error('Method not implemented');
    }
    async count() {
        throw new Error('Method not implemented');
    }
    async update(id, updateFields) {
        throw new Error('Method not implemented');
    }
    async findById(id) {
        throw new Error('Method not implemented');
    }
    async findAll() {
        throw new Error('Method not implemented');
    }
    async findByIdWithPassword(id) {
        throw new Error('Method not implemented');
    }
    async findByGoogleId(googleId) {
        throw new Error('Method not implemented');
    }
    async add(user) {
        throw new Error('Method not implemented');
    }
    async delete(id) {
        throw new Error('Method not implemented');
    }
    /**
     * Tìm tất cả kỹ thuật viên (TECHNICIAN) thuộc một trung tâm dịch vụ
     * @param {string} serviceCenterId
     */
    async findTechniciansByCenter(serviceCenterId) {
        throw new Error('Method not implemented');
    }
    async findCustomerByPhone(phone) {
        throw new Error("Method 'findCustomerByPhone()' must be implemented.");
    }

    async findStaffByCenter(serviceCenterId) {
        throw new Error("Method 'findStaffByCenter()' must be implemented.");
    }
    /**
     * Cập nhật trạng thái active/inactive của user
     */
    async updateStatus(userId, isActive) {
        throw new Error("Method 'updateStatus()' must be implemented.");
    }
}

module.exports = IUserRepository;