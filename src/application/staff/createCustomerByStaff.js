// Tệp: src/application/staff/createCustomerByStaff.js
const bcrypt = require('bcryptjs');
const UserEntity = require('../../domain/entities/User');
const { Role, Prisma } = require('@prisma/client'); // Import Prisma

class CreateCustomerByStaff {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    _generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async execute({ fullName, phoneNumber, email }) {
        if (!fullName || !phoneNumber) {
            throw new Error('Full name and phone number are required.');
        }
        
        // (Logic tạo password, code... giữ nguyên)
        const temporaryPassword = this._generateRandomPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);
        
        // const userCount = await this.userRepository.count();
        // const newUserNumber = userCount + 1;
        // // Sửa: CUSTOMER không cần employeeCode, nhưng có thể cần userCode
        // //const userCode = `CUS${newUserNumber.toString().padStart(6, '0')}`; // Ví dụ: CUS000001

        const userData = {
            fullName,
            email: email || null,
            phoneNumber,
            passwordHash,
            role: Role.CUSTOMER, 
            employeeCode: null, // CUSTOMER không phải là nhân viên
            // userCode: userCode, // (Nếu bạn có trường userCode)
        };

        try {
            const newUserPrisma = await this.userRepository.create(userData);

            console.log(`Staff created customer ${newUserPrisma.fullName} with temp pass: ${temporaryPassword}`);
            
            const safeUser = new UserEntity(newUserPrisma);
            return {
                user: safeUser,
                temporaryPassword: temporaryPassword
            };
        } catch (error) {
            // --- (SỬA LỖI TOCTOU) ---
            // Bẫy lỗi P2002
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                 if (error.meta && error.meta.target.includes('email')) {
                    throw new Error('Email already in use.');
                }
                 if (error.meta && error.meta.target.includes('phoneNumber')) { // Giả sử SĐT là unique
                    throw new Error('Phone number already in use.');
                }
                throw new Error('A unique constraint was violated.');
            }
            // --- KẾT THÚC SỬA LỖI ---
            throw error;
        }
    }
}
module.exports = CreateCustomerByStaff;