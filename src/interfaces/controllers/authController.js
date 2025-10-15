class AuthController {
    constructor(registerUserUseCase, loginUserUseCase, createUserUseCase, getProfileUseCase, viewAllAccountsUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.createUserUseCase = createUserUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.viewAllAccountsUseCase = viewAllAccountsUseCase;
    }

    async register(req, res) {
        const { fullName, email, password } = req.body;
        try {
            const user = await this.registerUserUseCase.execute({
                fullName,
                email,
                password,
                role: 'CUSTOMER', // Mặc định là khách hàng khi tự đăng ký
            });
            res.status(201).json(user);
            console.log("Register successfully, Welcome " + user.fullName);
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
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}



module.exports = AuthController;