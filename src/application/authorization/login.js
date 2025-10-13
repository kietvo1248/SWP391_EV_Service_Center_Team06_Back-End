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
            throw new Error('Invalid credentials.'); // Lỗi không tìm thấy email
        }

        // 2. So sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong DB
        const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordMatch) {
            throw new Error('Invalid credentials.'); // Lỗi sai mật khẩu
        }

        // 3. Tạo payload cho JWT (chứa thông tin cần thiết về user)
        const payload = {
            //id: user.id,
            email: user.email,
            role: user.role,
        };

        // 4. Ký và tạo token với khóa bí mật và thời gian hết hạn
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token sẽ hết hạn sau 1 giờ
        });

        // 5. Trả về token
        return { token };
    }
}

module.exports = LoginUser;