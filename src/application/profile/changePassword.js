const bcrypt = require('bcryptjs');

class ChangePassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ userId, oldPassword, newPassword }) {
        // 1. Lấy thông tin người dùng, bao gồm cả mật khẩu hash
        const user = await this.userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        // 2. So sánh mật khẩu cũ người dùng nhập với mật khẩu đã lưu
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordMatch) {
            throw new Error('Incorrect old password.');
        }

        // 3. Mã hóa mật khẩu mới
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // 4. Cập nhật mật khẩu mới vào cơ sở dữ liệu
        await this.userRepository.update(userId, { passwordHash: newPasswordHash });

        return { message: 'Password changed successfully.' };
    }
}

module.exports = ChangePassword;