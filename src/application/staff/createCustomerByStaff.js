const bcrypt = require('bcryptjs');
const UserEntity = require('../../domain/entities/User');
const { Role } = require('@prisma/client'); // Import Role

class CreateCustomerByStaff {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Tái sử dụng logic tạo mật khẩu tạm
    _generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async execute({ fullName, phoneNumber, email }) {
        if (!fullName || !phoneNumber) {
            throw new Error('Full name and phone number are required.');
        }

        // Kiểm tra SĐT hoặc Email (nếu có)
        if (email) {
            const existingEmail = await this.userRepository.findByEmail(email);
            if (existingEmail) {
                throw new Error('Email already in use.');
            }
        }
        // (Nên thêm logic kiểm tra SĐT đã tồn tại chưa)

        const temporaryPassword = this._generateRandomPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);
        
        // Tái sử dụng logic tạo userCode từ use case CreateAccount
        const userCount = await this.userRepository.count();
        const newUserNumber = userCount + 1;
        const userCode = `CUSTOMER${newUserNumber.toString().padStart(2, '0')}`;

        const userData = {
            fullName,
            email: email || null,
            phoneNumber,
            passwordHash,
            role: Role.CUSTOMER, 
            userCode,
        };

        const newUserPrisma = await this.userRepository.create(userData);

        console.log(`Staff created customer ${newUserPrisma.fullName} with temp pass: ${temporaryPassword}`);
        
        const safeUser = new UserEntity(newUserPrisma);
        return {
            user: safeUser,
            temporaryPassword: temporaryPassword
        };
    }
}
module.exports = CreateCustomerByStaff;