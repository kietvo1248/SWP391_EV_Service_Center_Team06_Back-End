class AuthController {
    constructor(registerUserUseCase, loginUserUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
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
}

module.exports = AuthController;