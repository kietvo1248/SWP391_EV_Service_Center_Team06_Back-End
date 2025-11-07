// Tệp: src/application/authorization/register.js
const User = require('../../domain/entities/User');
const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client'); // Import Prisma để bắt lỗi

class RegisterUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Thực thi nghiệp vụ đăng ký người dùng mới.
     * @param {object} userData - Dữ liệu người dùng từ form.
     * @param {string} userData.fullName - Họ và tên.
     * @param {string} userData.email - Email.
     * @param {string} userData.password - Mật khẩu.
     * @param {string} userData.confirmPassword - Mật khẩu xác nhận.
     * @param {string} userData.phoneNumber - Số điện thoại.
     * @returns {Promise<User>} Đối tượng người dùng đã được tạo.
     */

    async execute({ fullName, email, password, confirmPassword, phoneNumber }) {
        // 1. Validation (Giữ nguyên)
        if (!fullName || !email || !password || !confirmPassword) {
            throw new Error('Vui lòng điền đầy đủ các trường bắt buộc.');
        }
        if (password !== confirmPassword) {
            throw new Error('Mật khẩu và mật khẩu xác nhận không khớp.');
        }

        // --- (SỬA LỖI TOCTOU) ---
        // 2. XÓA BỎ bước kiểm tra email-

        // 3. Mã hóa mật khẩu (Giữ nguyên)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Tạo đối tượng User entity mới (Giữ nguyên)
        const newUser = new User(
            null, 'CUSTOMER', fullName, email, hashedPassword, 'CUSTOMER', 
            phoneNumber, null, null, null, true // Đã sửa constructor cho khớp file
        );

        try {
            const createdUser = await this.userRepository.add(newUser);

            // 5. Trả về (Giữ nguyên)
            return new User(
                createdUser.id, createdUser.employeeCode, createdUser.fullName, 
                createdUser.email, null, createdUser.role, createdUser.phoneNumber, 
                createdUser.address, null, null, createdUser.isActive
            );
        } catch (error) {
            // --- (SỬA LỖI TOCTOU) ---
            // 6. Bẫy lỗi P2002 (Unique constraint violation)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error('Email này đã được sử dụng.');
            }
            // --- KẾT THÚC SỬA LỖI ---
            throw error;
        }
    }
}

module.exports = RegisterUserUseCase;