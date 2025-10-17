const { sendPasswordResetEmail } = require('../../../infrastructure/service/resetpasswordmail');

class ForgotPassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User with this email does not exist.');
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await this.userRepository.update(user.id, {
            resetPasswordCode: resetCode,
            resetPasswordExpires: resetExpires,
        });

        await sendPasswordResetEmail(user.email, resetCode);

        return { message: 'Password reset code has been sent to your email.' };
    }
}

module.exports = ForgotPassword;