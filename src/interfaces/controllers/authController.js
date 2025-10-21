class AuthController {
    constructor(registerUserUseCase, loginUserUseCase, createUserUseCase, 
        getProfileUseCase, viewAllAccountsUseCase, updateUserProfileUseCase, 
        changePasswordUseCase, forgotPasswordUseCase, verifyResetCodeUseCase, 
        resetPasswordUseCase, googleSignInUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.createUserUseCase = createUserUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.viewAllAccountsUseCase = viewAllAccountsUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.verifyResetCodeUseCase = verifyResetCodeUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.googleSignInUseCase = googleSignInUseCase;
    }

    async register(req, res) {
        // Lấy tất cả các trường cần thiết từ body của request
        const { fullName, email, password, confirmPassword, phoneNumber } = req.body;
        
        try {
            const user = await this.registerUserUseCase.execute({
                fullName,
                email,
                password,
                confirmPassword,
                phoneNumber,
            });
            
            res.status(201).json({ message: "Đăng ký thành công!", user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const result = await this.loginUserUseCase.execute({ email, password });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Lấy thông tin của chính mình (self)
    async getProfile(req, res) {
        try {
            // ID được lấy từ token đã giải mã (bởi authMiddleware)
            const userId = req.user.id;
            const user = await this.getProfileUseCase.execute(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async viewAllAccounts(req, res) {
        try {
            const users = await this.viewAllAccountsUseCase.execute();
            res.status(200).json(users);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async createAccount(req, res) {
        const { fullName, email, role } = req.body;
        try {
            const user = await this.createUserUseCase.execute({
                fullName,
                email,
                role, // Vai trò do admin chỉ định
            });
            res.status(201).json(user);
            console.log("Create account successfully for " + user.fullName + " with role " + user.role );
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async updateProfile(req, res) {
        const userId = req.user.id;
        const updateData = req.body;
        try {
            const updatedUser = await this.updateUserProfileUseCase.execute(userId, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async changePassword(req, res) {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        try {
            const result = await this.changePasswordUseCase.execute({ userId, oldPassword, newPassword });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Xử lý quên mật khẩu
     async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            const result = await this.forgotPasswordUseCase.execute(email);
            res.status(200).json(result);
        } catch (error) {
            // Trả về 404 nếu không tìm thấy user để bảo mật hơn
            res.status(404).json({ message: error.message });
        }
    }
    // Xử lý xác thực mã reset
    async verifyResetCode(req, res) {
        const { email, resetCode } = req.body;
        try {
            const result = await this.verifyResetCodeUseCase.execute(email, resetCode);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Xử lý đặt lại mật khẩu mới
    async resetPassword(req, res) {
        const { newPassword, confirmPassword } = req.body;
        const authHeader = req.header('Authorization');

        if (!newPassword || newPassword.length < 5) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 5 ký tự.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
        }

        const resetToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        try {
            const result = await this.resetPasswordUseCase.execute(resetToken, newPassword);
            res.status(200).json(result);
        } catch (error) {
            // Token không hợp lệ hoặc hết hạn
            res.status(401).json({ message: error.message });
        }
    }
    // Xử lý đăng nhập bằng Google
    async googleSignIn(req, res) {
        const { profile } = req.body; // Thông tin profile từ client
        try {
            const user = await this.googleSignInUseCase.execute(profile);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

}

module.exports = AuthController;