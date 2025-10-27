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

    async execute({ fullName, email, role, serviceCenterId }, actor) {
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

        const userData = {
            fullName,
            email,
            passwordHash,
            role,
            userCode,
        };

        // If the actor is a STATION_ADMIN and is creating an employee, link to their station
        const employeeRoles = ['STAFF', 'TECHNICIAN', 'INVENTORY_MANAGER', 'STATION_ADMIN'];
        if (actor.role === 'STATION_ADMIN' && employeeRoles.includes(role)) {
            userData.serviceCenterId = actor.serviceCenterId;
        }

        // If the actor is an ADMIN and provides a serviceCenterId for an employee, use it.
        // This allows ADMIN to assign employees to any station.
        if (actor.role === 'ADMIN' && employeeRoles.includes(role) && serviceCenterId) {
            // TODO: Optionally, validate if serviceCenterId exists in the database
            userData.serviceCenterId = serviceCenterId;
        }

        // 2. Tạo người dùng mới với đầy đủ thông tin
        const newUser = await this.userRepository.create(userData);

        // 3. Log mật khẩu tạm thời ra console cho admin
        console.log(`Create account successfully for ${newUser.fullName} with temporary password: ${temporaryPassword}`);
        
        // 4. Trả về đối tượng User an toàn cùng với mật khẩu tạm thời
        const safeUser = new User(newUser.id, newUser.userCode, newUser.fullName, newUser.email, null, newUser.role, newUser.phoneNumber, newUser.address, newUser.serviceCenterId, null, newUser.isActive);
        return {
            user: safeUser,
            temporaryPassword: temporaryPassword
        };
    }
}

module.exports = CreateAccount;