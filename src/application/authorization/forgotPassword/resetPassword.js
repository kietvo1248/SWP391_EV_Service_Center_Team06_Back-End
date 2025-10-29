const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class ResetPassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(resetToken, newPassword) {
        if (!resetToken) {
            throw new Error('Reset token is required.');
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error('Invalid or expired reset token.');
        }
        
        // Ensure this token is specifically for password reset
        if (decoded.purpose !== 'password-reset') {
            throw new Error('Invalid token purpose.');
        }

        const userId = decoded.user.id;
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found.');
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await this.userRepository.update(userId, {
            passwordHash: hashedPassword, // Sửa từ 'password' thành 'passwordHash'
            resetPasswordCode: null,
            resetPasswordExpires: null,
        });

        return { message: 'Password has been reset successfully.' };
    }
}

module.exports = ResetPassword;