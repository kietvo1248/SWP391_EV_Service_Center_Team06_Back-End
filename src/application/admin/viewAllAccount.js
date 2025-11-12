// Tệp: src/application/admin/viewAllAccount.js
const User = require('../../domain/entities/User');
class ViewAllAccounts {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        const users = await this.userRepository.findAll();
        // --- SỬA LỖI 'userCode' ---
        return users.map(user => new User(
            user.id,
            user.employeeCode, 
            user.fullName,
            user.email,
            null, // passwordHash
            user.role,
            user.phoneNumber,
            user.address,
            user.serviceCenterId,
            null, // googleId
            user.isActive
        ));
    }
}
module.exports = ViewAllAccounts;