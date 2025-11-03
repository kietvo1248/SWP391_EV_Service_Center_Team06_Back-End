const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../domain/entities/User');

class LoginUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ email, password }) {
        // 1. Tìm người dùng bằng email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password.'); // Lỗi không tìm thấy email
        }

        if (!user.passwordHash){
            throw new Error('This account does not have a password set. Please use Google login.');
        }
        const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordMatch) {
            throw new Error('Invalid email or password.');
        }

        // 3. Tạo payload cho JWT (user cần gì thì chứa nó)
        const payload = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            serviceCenterId: user.serviceCenterId || null,
            employeeCode: user.employeeCode || null
        };

        // 4. Ký và tạo token với khóa bí mật và thời gian hết hạn
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // 5. Trả về đối tượng User an toàn và token
        const safeUser = new User(
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
        );
        return { message: "Login successful", token, user: safeUser };
    }
}

module.exports = LoginUser;