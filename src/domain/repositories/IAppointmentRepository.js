class IAppointmentRepository {
    add(appointmentData) {
        throw new Error("Method 'add()' must be implemented.");
    }
    /**
     * Lấy danh sách lịch hẹn theo trung tâm và (tùy chọn) trạng thái
     * @param {string} serviceCenterId
     * @param {string} status (ví dụ: 'PENDING')
     */
    async findByCenterId(serviceCenterId, status) {
        throw new Error("Method 'findByCenterId()' must be implemented.");
    }

    /**
     * Lấy chi tiết một lịch hẹn bằng ID
     * @param {string} appointmentId
     */
    async findById(appointmentId) {
        throw new Error("Method 'findById()' must be implemented.");
    }

    /**
     * Cập nhật trạng thái của một lịch hẹn
     * @param {string} appointmentId
     * @param {string} status
     * @param {object} tx - Prisma Transaction Client (tùy chọn)
     */
    async updateStatus(appointmentId, status, tx) {
        throw new Error("Method 'updateStatus()' must be implemented.");
    }
    async findConfirmedByCustomerPhone(serviceCenterId, phone) {
        throw new Error("Method 'findConfirmedByCustomerPhone()' must be implemented.");
    }
    async findByIdAndCustomer(appointmentId, customerId) {
        throw new Error("Method 'findByIdAndCustomer()' must be implemented.");
    }
}

module.exports = IAppointmentRepository;
