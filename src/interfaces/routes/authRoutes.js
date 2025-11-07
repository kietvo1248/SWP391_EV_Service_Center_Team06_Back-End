const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');


// Hàm khởi tạo router, nhận controller làm tham số
// Đây là kỹ thuật Dependency Injection để controller không bị cứng
const createAuthRouter = (authController, passport) => {
    const router = express.Router();
    // authentication: xác thực (đăng nhập)
    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));
    router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));
    router.post('/create-account', authenticate, authorize(['ADMIN', 'STATION_ADMIN']), (req, res) => authController.createAccount(req, res));
    router.get('/all-profile', authenticate, authorize(['ADMIN']), (req, res) => authController.viewAllAccounts(req, res));
    router.put('/update-profile', authenticate, (req, res) => authController.updateProfile(req, res));
    router.post('/change-password', authenticate, (req, res) => authController.changePassword(req, res));

    //quên mật khẩu 
    router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
    router.post('/verify-reset-code', (req, res) => authController.verifyResetCode(req, res));
    router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

     // --- GOOGLE OAUTH ROUTES ---
    // 1. Route bắt đầu quá trình xác thực -> Điều hướng đến Google
    router.get('/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    // 2. Route callback sau khi Google xác thực xong
    router.get('/google/callback', 
        passport.authenticate('google', { 
            failureRedirect: '/login-failure', // Chuyển hướng nếu thất bại (frontend xử lý)
            session: false // Không tạo session vì chúng ta dùng JWT
        }),
        (req, res) => {
            // Xác thực thành công, req.user chứa { user, token } từ passportConfig

            // Lấy token từ req.user (do passportConfig của bạn trả về)
            const token = req.user.token;

            // Lấy địa chỉ frontend từ biến môi trường (an toàn hơn)
            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Thay bằng URL frontend của bạn

            // Chuyển hướng người dùng VỀ LẠI frontend
            // Đính kèm token vào URL query
            res.redirect(`${FRONTEND_URL}/login-success?token=${token}`);
            
            res.status(200).json({
                message: "Google authentication successful",
                token: req.user.token,
                user: req.user.user
            });
        }
    );

    return router;
};


module.exports = createAuthRouter;