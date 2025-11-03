const bcrypt = require('bcryptjs'); 
const User = require('../../domain/entities/User'); 
const { Role } = require('@prisma/client');

class CreateAccount {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Random ngẫu nhiên mật khẩu 6 chữ số
    _generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async execute({ fullName, email, role, phoneNumber, address, serviceCenterId }, actor) {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already in use.');
        }

        let employeeCode = null;
        if (role !== Role.CUSTOMER) {
            const userCount = await this.userRepository.count();
            const rolePrefix = role.substring(0, 3).toUpperCase();
            employeeCode = `${rolePrefix}${(userCount + 1).toString().padStart(4, '0')}`;
        }
        // --- KẾT THÚC THAY ĐỔI ---

        const temporaryPassword = this._generateRandomPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        const userData = {
           fullName,
            email,
            passwordHash,
            role,
            phoneNumber: phoneNumber || null,
            address: address || null,
            serviceCenterId: serviceCenterId || null,
            employeeCode: employeeCode, 
            isActive: true,
            googleId: null
        };

        // If the actor is a STATION_ADMIN and is creating an employee, link to their station
        const employeeRoles = ['STAFF', 'TECHNICIAN', 'INVENTORY_MANAGER', 'STATION_ADMIN'];
        if (actor.role === 'STATION_ADMIN' && employeeRoles.includes(role)) {
            userData.serviceCenterId = actor.serviceCenterId;
        }

        // 2. Tạo người dùng mới với đầy đủ thông tin
        const newUser = await this.userRepository.create(userData);

        // 3. Log mật khẩu tạm thời ra console cho admin
        console.log(`Create account successfully for ${newUser.fullName} with temporary password: ${temporaryPassword}`);
        
        // 4. Trả về đối tượng User an toàn cùng với mật khẩu tạm thời
        const safeUser = new User(newUser.id, newUser.employeeCode, newUser.fullName, newUser.email, null, newUser.role, newUser.phoneNumber, newUser.address, newUser.serviceCenterId, null, newUser.isActive);
        return {
            user: safeUser,
            temporaryPassword: temporaryPassword
        };
    }
}

module.exports = CreateAccount;