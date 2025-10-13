const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const User = require('../../domain/entities/User');

class RegisterUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ fullName, email, password, role }) {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already in use.');
        }
        try {
            const userCount = await this.userRepository.count();
            const newUserNumber = userCount + 1;
            const userCode = `USER${newUserNumber.toString().padStart(2, '0')}`;

            // 4. Tạo người dùng mới với đầy đủ thông tin
            const newUser = await this.userRepository.create({
                // Prisma sẽ tự tạo UUID cho trường `id`
                fullName,
                email,
                passwordHash,
                role: 'CUSTOMER',
                userCode, // Gán userCode ngay khi tạo
            });

            // 5. Trả về đối tượng User an toàn
            return new User(newUser.id, newUser.fullName, newUser.email, newUser.role);

        } catch (error) {
            console.log(error);
        }

    }
}

module.exports = RegisterUser;