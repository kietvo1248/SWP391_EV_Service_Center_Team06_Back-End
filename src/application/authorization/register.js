const User = require('../../domain/entities/User');
const bcrypt = require('bcrypt');

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
        // 1. Validation: Kiểm tra các trường bắt buộc và mật khẩu khớp nhau
        if (!fullName || !email || !password || !confirmPassword) {
            throw new Error('Vui lòng điền đầy đủ các trường bắt buộc.');
        }
        if (password !== confirmPassword) {
            throw new Error('Mật khẩu và mật khẩu xác nhận không khớp.');
        }

        // 2. Kiểm tra email đã tồn tại hay chưa
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email này đã được sử dụng.');
        }

        // 3. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Tạo một đối tượng User entity mới
        const newUser = new User(
            null,           // id - sẽ được CSDL tự tạo
            null,           // userCode
            fullName,
            email,
            hashedPassword,
            'CUSTOMER',     // Vai trò mặc định khi tự đăng ký
            phoneNumber,    // Thêm số điện thoại
            null,           // address
            null,           // serviceCenterId
            null            // googleId
        );

        // 5. Lưu người dùng vào CSDL thông qua repository
        return this.userRepository.add(newUser);
    }
}

module.exports = RegisterUserUseCase;
