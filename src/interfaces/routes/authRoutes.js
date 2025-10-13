const express = require('express');

// Hàm khởi tạo router, nhận controller làm tham số
// Đây là kỹ thuật Dependency Injection để controller không bị cứng
const createAuthRouter = (authController) => {
    const router = express.Router();

    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));

    return router;
};

module.exports = createAuthRouter;