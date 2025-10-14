require('dotenv').config();
const express = require('express');

// Import các lớp đã tạo
const PrismaUserRepository = require('./src/infrastructure/repositories/PrismaUserRepository');
const AuthController = require('./src/interfaces/controllers/authController');
const createAuthRouter = require('./src/interfaces/routes/authRoutes');

//import các usecase
//authentication
const RegisterUser = require('./src/application/authorization/register');
const LoginUser = require('./src/application/authorization/login');
const createUser = require('./src/application/authorization/createAccount');



const app = express();
const port = process.env.PORT;

// Middlewares
app.use(express.json());

// --- Dependency Injection ---
// Khởi tạo các dependency từ trong ra ngoài
const userRepository = new PrismaUserRepository();
//authentication
const registerUseCase = new RegisterUser(userRepository);
const loginUseCase = new LoginUser(userRepository);
const createUserUseCase = new createUser(userRepository);
const authController = new AuthController(registerUseCase, loginUseCase, createUserUseCase);
const authRouter = createAuthRouter(authController);

// Sử dụng router
app.use('/api/auth', authRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});