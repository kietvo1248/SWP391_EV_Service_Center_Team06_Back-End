const express = require('express');
// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const dotenv = require('dotenv');
dotenv.config();
const passport = require('passport');
const initializePassport = require('./infrastructure/service/passport');
// Infrastructure
const PrismaUserRepository = require('./infrastructure/repositories/PrismaUserRepository');
const PrismaVehicleRepository = require('./infrastructure/repositories/PrismaVehicleRepository');
const PrismaAppointmentRepository = require('./infrastructure/repositories/PrismaAppointmentRepository');

// Interfaces
//==auth==
const AuthController = require('./interfaces/controllers/authController');
const createAuthRouter = require('./interfaces/routes/authRoutes');
//==vehicle==
const VehicleController = require('./interfaces/controllers/vehicleController');
const VehicleRouter = require('./interfaces/routes/vehicleRoutes');
//==appointment==
const AppointmentController = require('./interfaces/controllers/appointmentController');
const appointmentRouter = require('./interfaces/routes/appointmentRoutes');


// Application (Use Cases)
// authentication
const RegisterUser = require('./application/authorization/register');
const LoginUser = require('./application/authorization/login');
const createUser = require('./application/authorization/createAccount');
const viewUserProfile = require('./application/profile/viewProfile');
const viewAllAccounts = require('./application/admin/viewAllAccount');
const updateUserProfile = require('./application/profile/updateProfile');
const ChangePassword = require('./application/profile/changePassword');
const ForgotPassword = require('./application/authorization/forgotPassword/forgotPassword');
const VerifyResetCode = require('./application/authorization/forgotPassword/verifyToken');
const ResetPassword = require('./application/authorization/forgotPassword/resetPassword');
const googleSignIn = require('./application/authorization/googleSignIn');

//manage vehicle
const AddVehicle = require('./application/vehicles/addVehicles');
const ViewVehicles = require('./application/vehicles/viewVehicles');

//manage appointment
const CreateAppointment = require('./application/bookings/createAppointment');
const ListMyVehicles = require('./application/vehicles/listvehicle');
const GetServiceSuggestions = require('./application/bookings/suggestion');

// --- Khởi tạo ứng dụng Express ---
const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(passport.initialize());

// --- Dependency Injection (DI Container) ---
// Đây là trái tim của ứng dụng, nơi các lớp được kết nối với nhau
const userRepository = new PrismaUserRepository();
const vehicleRepository = new PrismaVehicleRepository();
const appointmentRepository = new PrismaAppointmentRepository();

// Initialize Passport with userRepository
initializePassport(passport, userRepository);

// Use Cases for Authentication
const registerUseCase = new RegisterUser(userRepository);
const loginUseCase = new LoginUser(userRepository);
const createUserUseCase = new createUser(userRepository);
const viewUserProfileUseCase = new viewUserProfile(userRepository);
const viewAllAccountsUseCase = new viewAllAccounts(userRepository);
const updateUserProfileUseCase = new updateUserProfile(userRepository);
const changePasswordUseCase = new ChangePassword(userRepository);
const forgotPasswordUseCase = new ForgotPassword(userRepository);
const verifyResetCodeUseCase = new VerifyResetCode(userRepository);
const resetPasswordUseCase = new ResetPassword(userRepository);
const googleSignInUseCase = new googleSignIn(userRepository);
// Use Cases for Vehicle Management
const addVehicleUseCase  = new AddVehicle(vehicleRepository);
const viewVehiclesUseCase = new ViewVehicles(vehicleRepository);

//Usce Cases for Appointment Management
const createAppointmentUseCase = new CreateAppointment(appointmentRepository, vehicleRepository, userRepository);
const listMyVehiclesUseCase = new ListMyVehicles(vehicleRepository);
const getServiceSuggestionsUseCase = new GetServiceSuggestions();

// Controller
const authController = new AuthController(
    registerUseCase,
    loginUseCase,
    createUserUseCase,
    viewUserProfileUseCase,
    viewAllAccountsUseCase,
    updateUserProfileUseCase,
    changePasswordUseCase,
    forgotPasswordUseCase,
    verifyResetCodeUseCase,
    resetPasswordUseCase,
    googleSignInUseCase

);
const vehicleController = new VehicleController(
    addVehicleUseCase,
    viewVehiclesUseCase
);

const appointmentController = new AppointmentController(
    createAppointmentUseCase,
    listMyVehiclesUseCase,
    getServiceSuggestionsUseCase
);

// Router
const authRouter = createAuthRouter(authController, passport);
const vehicleRouter = VehicleRouter(vehicleController);
const appointmentRouterInstance = appointmentRouter(appointmentController);

// --- Gắn Router vào ứng dụng ---
app.use('/api/auth', authRouter);
app.use('/api/vehicle', vehicleRouter);
app.use('/api/appointments', appointmentRouterInstance);


// swagger docs
const swaggerDocument = YAML.load('./docs/swagger.yaml'); 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Xử lý lỗi 404 ---
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;