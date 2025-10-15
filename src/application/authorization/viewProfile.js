const User = require('../../domain/entities/User');


class ViewAccount {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        // 1. Tìm người dùng bằng ID
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found.'); // Lỗi không tìm thấy người dùng
        }
        // 2. Trả về đối tượng User an toàn
        return new User(user.id, user.fullName, user.email, user.role);
    }
}


module.exports = ViewAccount;