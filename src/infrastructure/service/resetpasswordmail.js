// Tệp: src/infrastructure/service/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Hàm gửi email chung
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung HTML của email
 */
const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: `"EV Service Center" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        // Không ném lỗi để tránh làm hỏng luồng nghiệp vụ chính
    }
};

// Hàm cũ vẫn được giữ lại, sử dụng hàm chung
const sendPasswordResetEmail = async (to, code) => {
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Yêu cầu Đặt lại Mật khẩu</h2>
            <p>Mã xác minh của bạn là:</p>
            <h3 style="background: #f0f0f0; padding: 10px 15px;">${code}</h3>
            <p>Mã này sẽ hết hạn sau 10 phút.</p>
        </div>
    `;
    await sendEmail(to, 'Mã đặt lại mật khẩu của bạn', emailHtml);
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
};