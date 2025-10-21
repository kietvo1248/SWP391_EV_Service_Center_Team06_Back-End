const jwt = require('jsonwebtoken');

class VerifyResetCode {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(email, resetCode) {
        const user = await this.userRepository.findByEmail(email);

        if (!user || user.resetPasswordCode !== resetCode || user.resetPasswordExpires < new Date()) {
            throw new Error('Invalid or expired reset code.');
        }

        // Create a temporary token for the password reset step
        const resetTokenPayload = {
            user: {
                id: user.id,
                role: user.role.name,
            },
            purpose: 'password-reset' 
        };

        const resetToken = jwt.sign(resetTokenPayload, process.env.JWT_SECRET, {
            expiresIn: '10m', // Token is also valid for 10 minutes
        });

        return { message: 'Code verified successfully.', resetToken };
    }
}

module.exports = VerifyResetCode;