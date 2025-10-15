const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Hàm khởi tạo router, nhận controller làm tham số
// Đây là kỹ thuật Dependency Injection để controller không bị cứng
const createAuthRouter = (authController) => {
    const router = express.Router();
    // authentication: xác thực (đăng nhập)
    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));
    router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));
    router.post('/create-account', authenticate, authorize(['ADMIN']), (req, res) => authController.createAccount(req, res));
    router.get('/all-profile', authenticate, authorize(['ADMIN']), (req, res) => authController.viewAllAccounts(req, res));
    router.post('/update-profile', authenticate, (req, res) => authController.updateProfile(req, res));
    router.post('/change-password', authenticate, (req, res) => authController.changePassword(req, res));

    return router;
};

module.exports = createAuthRouter;