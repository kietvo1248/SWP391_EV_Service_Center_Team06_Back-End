const express = require('express');
// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swaggerConfig');
// Infrastructure
const PrismaUserRepository = require('./infrastructure/repositories/PrismaUserRepository');
const PrismaVehicleRepository = require('./infrastructure/repositories/PrismaVehicleRepository');

// Interfaces
//==auth==
const AuthController = require('./interfaces/controllers/authController');
const createAuthRouter = require('./interfaces/routes/authRoutes');
//==vehicle==
const VehicleController = require('./interfaces/controllers/vehicleController');
const VehicleRouter = require('./interfaces/routes/vehicleRoutes');

// Application (Use Cases)
// authentication
const RegisterUser = require('./application/authorization/register');
const LoginUser = require('./application/authorization/login');
const createUser = require('./application/authorization/createAccount');
const viewUserProfile = require('./application/profile/viewProfile');
const viewAllAccounts = require('./application/admin/viewAllAccount');
const updateUserProfile = require('./application/profile/updateProfile');
const ChangePassword = require('./application/profile/changePassword');

//manage vehicle
const AddVehicle = require('./application/vehicles/addVehicles');
const ViewVehicles = require('./application/vehicles/viewVehicles');

// --- Khởi tạo ứng dụng Express ---
const app = express();

// --- Middlewares ---
app.use(express.json());

// --- Dependency Injection (DI Container) ---
// Đây là trái tim của ứng dụng, nơi các lớp được kết nối với nhau
const userRepository = new PrismaUserRepository();
const vehicleRepository = new PrismaVehicleRepository();

// Use Cases for Authentication
const registerUseCase = new RegisterUser(userRepository);
const loginUseCase = new LoginUser(userRepository);
const createUserUseCase = new createUser(userRepository);
const viewUserProfileUseCase = new viewUserProfile(userRepository);
const viewAllAccountsUseCase = new viewAllAccounts(userRepository);
const updateUserProfileUseCase = new updateUserProfile(userRepository);
const changePasswordUseCase = new ChangePassword(userRepository);

// Use Cases for Vehicle Management
const addVehicleUseCase  = new AddVehicle(vehicleRepository);
const viewVehiclesUseCase = new ViewVehicles(vehicleRepository);

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
const vehicleController = new VehicleController(
    addVehicleUseCase,
    viewVehiclesUseCase
);

// Router
const authRouter = createAuthRouter(authController);
const vehicleRouter = VehicleRouter(vehicleController);

// --- Gắn Router vào ứng dụng ---
app.use('/api/auth', authRouter);
app.use('/api/vehicle', vehicleRouter);


// swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- Xử lý lỗi 404 ---
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;