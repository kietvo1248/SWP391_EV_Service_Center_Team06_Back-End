const express = require('express');

// Infrastructure
const PrismaUserRepository = require('./infrastructure/repositories/PrismaUserRepository');

// Interfaces
const AuthController = require('./interfaces/controllers/authController');
const createAuthRouter = require('./interfaces/routes/authRoutes');

// Application (Use Cases)
const RegisterUser = require('./application/authorization/register');
const LoginUser = require('./application/authorization/login');
const createUser = require('./application/authorization/createAccount');
const viewUserProfile = require('./application/authorization/viewProfile');
const viewAllAccounts = require('./application/authorization/viewAllAccount');
const updateUserProfile = require('./application/authorization/updateProfile');
const ChangePassword = require('./application/authorization/changePassword');

// --- Khởi tạo ứng dụng Express ---
const app = express();

// --- Middlewares ---
app.use(express.json());

// --- Dependency Injection (DI Container) ---
// Đây là trái tim của ứng dụng, nơi các lớp được kết nối với nhau
const userRepository = new PrismaUserRepository();

// Use Cases for Authentication
const registerUseCase = new RegisterUser(userRepository);
const loginUseCase = new LoginUser(userRepository);
const createUserUseCase = new createUser(userRepository);
const viewUserProfileUseCase = new viewUserProfile(userRepository);
const viewAllAccountsUseCase = new viewAllAccounts(userRepository);
const updateUserProfileUseCase = new updateUserProfile(userRepository);
const changePasswordUseCase = new ChangePassword(userRepository);

// Controller
const authController = new AuthController(
    registerUseCase,
    loginUseCase,
    createUserUseCase,
    viewUserProfileUseCase,
    viewAllAccountsUseCase,
    updateUserProfileUseCase,
    changePasswordUseCase
);

// Router
const authRouter = createAuthRouter(authController);

// --- Gắn Router vào ứng dụng ---
app.use('/api/auth', authRouter);

module.exports = app;