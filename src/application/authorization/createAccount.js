const user = require('../../domain/entities/User');

class CreateAccount {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Random ngẫu nhiên mật khẩu 6 chữ số (xổ số)
    _generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async execute({ fullName, email, password, role }) {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already in use.');
        }
        try {
            const temporaryPassword = this._generateRandomPassword();
            const passwordHash = await bcrypt.hash(temporaryPassword, 10);
            const userCount = await this.userRepository.count();
            const newUserNumber = userCount + 1;
            const userCode = `USER${newUserNumber.toString().padStart(2, '0')}`;
            // 4. Tạo người dùng mới với đầy đủ thông tin
            const newUser = await this.userRepository.create({
                // Prisma sẽ tự tạo UUID cho trường `id`
                fullName,
                email,
                passwordHash,
                role,
                userCode,
            });
            // 5. Trả về đối tượng User an toàn
            console.log("Create account successfully for " + newUser.fullName + " with temporary password: " + temporaryPassword);
            return new user(newUser.id, newUser.fullName, newUser.email, newUser.role);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = CreateAccount;

