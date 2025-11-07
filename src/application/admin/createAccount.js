// Tệp: src/application/admin/createAccount.js
const bcrypt = require('bcryptjs'); 
const User = require('../../domain/entities/User'); 
const { Role, Prisma } = require('@prisma/client'); // Import Prisma

class CreateAccount {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    _generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async execute({ fullName, email, role, phoneNumber, address, serviceCenterId }, actor) {
        
        // --- (SỬA LỖI TOCTOU) ---
        // 1. XÓA BỎ bước kiểm tra email

        let employeeCode = null;
        if (role !== Role.CUSTOMER) {
            const userCount = await this.userRepository.count();
            const rolePrefix = role.substring(0, 3).toUpperCase();
            employeeCode = `${rolePrefix}${(userCount + 1).toString().padStart(4, '0')}`;
        }
        const temporaryPassword = this._generateRandomPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        const userData = {
           fullName, email, passwordHash, role,
           phoneNumber: phoneNumber || null,
           address: address || null,
           serviceCenterId: serviceCenterId || null,
           employeeCode: employeeCode, 
           isActive: true, googleId: null
        };

        if (actor.role === 'STATION_ADMIN' && (Object.values(Role).includes(role) && role !== Role.CUSTOMER)) {
             userData.serviceCenterId = actor.serviceCenterId;
        }

        try {
            // 2. Tạo người dùng mới
            const newUser = await this.userRepository.create(userData);

            // (Log và trả về... giữ nguyên)
            console.log(`Create account successfully for ${newUser.fullName} with temporary password: ${temporaryPassword}`);
            
            const safeUser = new User(newUser.id, newUser.employeeCode, newUser.fullName, newUser.email, null, newUser.role, newUser.phoneNumber, newUser.address, newUser.serviceCenterId, null, newUser.isActive);
            return {
                user: safeUser,
                temporaryPassword: temporaryPassword
            };
        } catch (error) {
            // --- (SỬA LỖI TOCTOU) ---
            // 3. Bẫy lỗi P2002
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                if (error.meta && error.meta.target.includes('email')) {
                    throw new Error('Email already in use.');
                }
                if (error.meta && error.meta.target.includes('employeeCode')) {
                    throw new Error('Employee code generation conflict. Please try again.');
                }
                throw new Error('A unique constraint was violated.');
            }
            throw error;
        }
    }
}

module.exports = CreateAccount;