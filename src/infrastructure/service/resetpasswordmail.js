const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // Lấy từ .env, nếu không có thì mặc định là 'gmail'
    secure: true, // Gmail yêu cầu secure connection
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPasswordResetEmail = async (to, code) => {
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Yêu cầu Đặt lại Mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Mã xác minh của bạn là:</p>
            <h3 style="background: #f0f0f0; padding: 10px 15px; border-radius: 5px; display: inline-block;">${code}</h3>
            <p>Mã này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ EV Maintenance Service</p>
        </div>
    `;

    const mailOptions = {
        from: `"EV Maintenance Service" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Mã đặt lại mật khẩu của bạn',
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Could not send password reset email.');
    }
};

module.exports = {
    sendPasswordResetEmail,
};