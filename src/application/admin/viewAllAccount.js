const User = require('../../domain/entities/User');
class ViewAllAccounts {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        // 1. Lấy tất cả người dùng
        const users = await this.userRepository.findAll();
        // 2. Trả về danh sách các đối tượng User an toàn
        return users.map(user => new User(
            user.id,
            user.userCode,
            user.fullName,
            user.email,
            null, // passwordHash
            user.role,
            user.phoneNumber,
            user.address,
            user.serviceCenterId,
            null, // googleId
            user.isActive
            // googleId is not needed for this response
        ));
    }
}

module.exports = ViewAllAccounts;
