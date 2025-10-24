const express = require('express');
const cors = require('cors');
// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const dotenv = require('dotenv');
dotenv.config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const initializePassport = require('./infrastructure/service/passport');
// Infrastructure
const PrismaUserRepository = require('./infrastructure/repositories/PrismaUserRepository');
const PrismaVehicleRepository = require('./infrastructure/repositories/PrismaVehicleRepository');
const PrismaAppointmentRepository = require('./infrastructure/repositories/PrismaAppointmentRepository');
const PrismaServiceCenterRepository = require('./infrastructure/repositories/PrismaServiceCenterRepository');
const PrismaServiceTypeRepository = require('./infrastructure/repositories/PrismaServiceTypeRepository');
const PrismaServiceRecordRepository = require('./infrastructure/repositories/PrismaServiceRecordRepository');
const PrismaInvoiceRepository = require('./infrastructure/repositories/PrismaInvoiceRepository');
const PrismaQuotationRepository = require('./infrastructure/repositories/PrismaQuotationRepository');
const PrismaPaymentRepository = require('./infrastructure/repositories/PrismaPaymentRepository');


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
//==service center==
const ServiceCenterController = require('./interfaces/controllers/serviceCenterController');
const serviceCenterRouter = require('./interfaces/routes/serviceCenterRoutes');

//staff
const StaffController = require('./interfaces/controllers/staffController');
const staffRouter = require('./interfaces/routes/staffRoutes');
//technician
const TechnicianController = require('./interfaces/controllers/technicianController');
const technicianRouter = require('./interfaces/routes/technicianRoutes');


// Application (Use Cases)
// authentication
const RegisterUser = require('./application/authorization/register');
const LoginUser = require('./application/authorization/login');
const createUser = require('./application/admin/createAccount');
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
const ListServiceTypes = require('./application/bookings/listAllServiceType');

//service center
const ListAllServiceCenters = require('./application/service_centers/listAllServiceCenter');
const getAvailableSlots = require('./application/service_centers/getAvailableSlot');

//staff flow
const FindAppointmentsByPhone = require('./application/staff/findAppointmentByPhone');
const StartAppointmentProgress = require('./application/staff/startAppointment');
const ListCenterAppointments = require('./application/staff/listAppointment');
const GetAppointmentDetails = require('./application/bookings/getAppointmentDetails'); // xem chi tiết cuộc hẹn, có thể tái sử dụng
const ListCenterTechnicians = require('./application/staff/listCenterTechnician');
const AssignAndConfirmAppointment = require('./application/staff/confirmAppointment');
const CreateInvoice = require('./application/staff/createInvoice');
const RecordCashPayment = require('./application/staff/recordCashPayment');
// Technician Workflow
const ListTechnicianTasks = require('./application/technician/listTechnicianTask'); 
const SubmitDiagnosis = require('./application/technician/submitDiagnosis');

// --- Khởi tạo ứng dụng Express ---
const app = express();

// --- Middlewares ---
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(passport.initialize());

// --- Dependency Injection (DI Container) ---
// Đây là trái tim của ứng dụng, nơi các lớp được kết nối với nhau
const userRepository = new PrismaUserRepository(prisma);
const vehicleRepository = new PrismaVehicleRepository(prisma);
const appointmentRepository = new PrismaAppointmentRepository(prisma);
const serviceCenterRepository = new PrismaServiceCenterRepository(prisma);
const serviceTypeRepository = new PrismaServiceTypeRepository(prisma);
const serviceRecordRepository = new PrismaServiceRecordRepository(prisma);
const invoiceRepository = new PrismaInvoiceRepository(prisma);
const quotationRepository = new PrismaQuotationRepository(prisma);
const paymentRepository = new PrismaPaymentRepository(prisma);  

// Initialize Passport with userRepository


// Use Cases for Authentication
const registerUseCase = new RegisterUser(userRepository);
const loginUseCase = new LoginUser(userRepository);
const createUserUseCase = new createUser(userRepository);
const getProfileUseCase = new viewUserProfile(userRepository, serviceCenterRepository);
const viewAllAccountsUseCase = new viewAllAccounts(userRepository);
const updateUserProfileUseCase = new updateUserProfile(userRepository);
const changePasswordUseCase = new ChangePassword(userRepository);
const forgotPasswordUseCase = new ForgotPassword(userRepository);
const verifyResetCodeUseCase = new VerifyResetCode(userRepository);
const resetPasswordUseCase = new ResetPassword(userRepository);
const googleSignInUseCase = new googleSignIn(userRepository);
// Use Cases for Vehicle Management
const addVehicleUseCase = new AddVehicle(vehicleRepository);
const viewVehiclesUseCase = new ViewVehicles(vehicleRepository);

//Usce Cases for Appointment Management
const createAppointmentUseCase = new CreateAppointment(appointmentRepository, vehicleRepository, userRepository);
const listMyVehiclesUseCase = new ListMyVehicles(vehicleRepository);
const getServiceSuggestionsUseCase = new GetServiceSuggestions();
const listServiceTypesUseCase = new ListServiceTypes(serviceTypeRepository);

// Use Cases for Service Center Management
const listAllServiceCentersUseCase = new ListAllServiceCenters(serviceCenterRepository);
const getAvailableSlotsUseCase = new getAvailableSlots(serviceCenterRepository);

// Use Cases for Staff Management   
const listCenterAppointmentsUseCase = new ListCenterAppointments(appointmentRepository);
const getAppointmentDetailsUseCase = new GetAppointmentDetails(appointmentRepository);
const listCenterTechniciansUseCase = new ListCenterTechnicians(userRepository);
const assignAndConfirmAppointmentUseCase = new AssignAndConfirmAppointment(
    appointmentRepository,
    serviceRecordRepository,
    userRepository,
    prisma // Truyền prisma client cho transaction
);
const findAppointmentsByPhoneUseCase = new FindAppointmentsByPhone(appointmentRepository);
const startAppointmentProgressUseCase = new StartAppointmentProgress(
    appointmentRepository,
    serviceRecordRepository,
    prisma // Truyền prisma client cho transaction
);
const createInvoiceUseCase = new CreateInvoice(
    appointmentRepository,
    serviceRecordRepository,
    quotationRepository,
    invoiceRepository,
    prisma // Truyền prisma client cho transaction
);
const recordCashPaymentUseCase = new RecordCashPayment(
    appointmentRepository,
    serviceRecordRepository,
    invoiceRepository,
    paymentRepository,
    prisma // Truyền prisma client cho transaction
);   
  
// Use Cases for Technician Management
const listTechnicianTasksUseCase = new ListTechnicianTasks(serviceRecordRepository);
const submitDiagnosisUseCase = new SubmitDiagnosis(
    serviceRecordRepository,
    quotationRepository,
    appointmentRepository,
    prisma
);



// Controller
const authController = new AuthController(
    registerUseCase,
    loginUseCase,
    createUserUseCase,
    getProfileUseCase,
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
    getServiceSuggestionsUseCase,
    listServiceTypesUseCase,
    getAppointmentDetailsUseCase
);

const serviceCenterController = new ServiceCenterController(
    listAllServiceCentersUseCase,
    getAvailableSlotsUseCase,
);
const staffController = new StaffController(
    listCenterAppointmentsUseCase,
    getAppointmentDetailsUseCase, // Re-added as second argument
    listCenterTechniciansUseCase,
    assignAndConfirmAppointmentUseCase,
    findAppointmentsByPhoneUseCase,
    startAppointmentProgressUseCase,
    createInvoiceUseCase,
    recordCashPaymentUseCase,
    
);
const technicianController = new TechnicianController(
    listTechnicianTasksUseCase,
    submitDiagnosisUseCase
);

initializePassport(passport, userRepository);

// Router
const authRouter = createAuthRouter(authController, passport);
const vehicleRouter = VehicleRouter(vehicleController);
const appointmentRouterInstance = appointmentRouter(appointmentController);
const serviceCenterRouterInstance = serviceCenterRouter(serviceCenterController);
const staffRouterInstance = staffRouter(staffController);
const technicianRouterInstance = technicianRouter(technicianController);

// --- Gắn Router vào ứng dụng ---
app.use('/api/auth', authRouter);
app.use('/api/vehicle', vehicleRouter);
app.use('/api/appointments', appointmentRouterInstance);
app.use('/api/service-centers', serviceCenterRouterInstance);
app.use('/api/staff', staffRouterInstance);
app.use('/api/technician', technicianRouterInstance);


// Health check endpoints
const { healthCheck, databaseHealthCheck } = require('../health');
app.get('/health', healthCheck);
app.get('/api/health/db', databaseHealthCheck);

// swagger docs
const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Xử lý lỗi 404 ---
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;