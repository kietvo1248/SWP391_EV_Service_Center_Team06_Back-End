const bcrypt = require('bcryptjs'); 
const User = require('../../domain/entities/User'); 

class CreateAccount {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Random ngẫu nhiên mật khẩu 6 chữ số
    _generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async execute({ fullName, email, role }) {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already in use.');
        }

        const temporaryPassword = this._generateRandomPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        const userCount = await this.userRepository.count();
        const newUserNumber = userCount + 1;
        const userCode = `USER${newUserNumber.toString().padStart(2, '0')}`;

        // 2. Tạo người dùng mới với đầy đủ thông tin
        const newUser = await this.userRepository.create({
            fullName,
            email,
            passwordHash,
            role,
            userCode,
        });

        // 3. Log mật khẩu tạm thời ra console cho admin
        console.log(`Create account successfully for ${newUser.fullName} with temporary password: ${temporaryPassword}`);
        
        // 4. Trả về đối tượng User an toàn
        return new User(newUser.id, newUser.fullName, newUser.email, newUser.role);
    }
}

module.exports = CreateAccount;