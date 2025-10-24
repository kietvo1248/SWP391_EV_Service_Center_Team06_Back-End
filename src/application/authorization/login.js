const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ email, password }) {
        // 1. Tìm người dùng bằng email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email.'); // Lỗi không tìm thấy email
        }

        const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordMatch) {
            throw new Error('Invalid password.');
        }

        // 3. Tạo payload cho JWT (user cần gì thì chứa nó)
        const payload = {
            id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                serviceCenterId: user.serviceCenterId || null
        };

        // 4. Ký và tạo token với khóa bí mật và thời gian hết hạn
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return { token };
    }
}

module.exports = LoginUser;