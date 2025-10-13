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



const app = express();
const port = process.env.PORT;

// Middlewares
app.use(express.json());

// --- Dependency Injection ---
// Khởi tạo các dependency từ trong ra ngoài
const userRepository = new PrismaUserRepository();
//authentication
const registerUserUseCase = new RegisterUser(userRepository);
const loginUserUseCase = new LoginUser(userRepository);
const authController = new AuthController(registerUserUseCase, loginUserUseCase);
const authRouter = createAuthRouter(authController);

// Sử dụng router
app.use('/api/auth', authRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});