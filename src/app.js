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
// const PrismaQuotationRepository = require('./infrastructure/repositories/PrismaQuotationRepository');
const PrismaPaymentRepository = require('./infrastructure/repositories/PrismaPaymentRepository');
const PrismaMaintenanceRecommendationRepository = require('./infrastructure/repositories/PrismaMaintenanceRecommendationRepository');
//repo phụ tùng
const PrismaInventoryItemRepository = require('./infrastructure/repositories/PrismaInventoryItemRepository');
const PrismaPartUsageRepository = require('./infrastructure/repositories/PrismaPartUsageRepository');
const PrismaRestockRequestRepository = require('./infrastructure/repositories/PrismaRestockRequestRepository');
const PrismaPartRepository = require('./infrastructure/repositories/PrismaPartRepository');
//repo trạm
const PrismaTechnicianProfileRepository = require('./infrastructure/repositories/PrismaTechnicianProfileRepository');
const PrismaCertificationRepository = require('./infrastructure/repositories/PrismaCertificationRepository');
const PrismaStaffCertificationRepository = require('./infrastructure/repositories/PrismaStaffCertificationRepository');



// Controllers và Routers
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
const InventoryController = require('./interfaces/controllers/inventoryController');
const inventoryRouter = require('./interfaces/routes/inventoryRoutes');
//admin
const AdminController = require('./interfaces/controllers/adminController');
const adminRouter = require('./interfaces/routes/adminRoutes');
//station
const StationController = require('./interfaces/controllers/stationController');
const stationRouter = require('./interfaces/routes/stationRoutes');



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
const ViewVehicles = require('./application/vehicles/listvehicle'); // Đổi tên từ listvehicle -> ViewVehicles
const GetVehicleDetails = require('./application/vehicles/getVehicleDetails'); 
const UpdateVehicle = require('./application/vehicles/updateVehicle');         
const DeleteVehicle = require('./application/vehicles/deleteVehicle');         
const ListVehicleModels = require('./application/vehicles/listVehicleModels'); 
const ListCompatibleBatteries = require('./application/vehicles/listCompatibleBatteries'); 

//manage appointment
const CreateAppointment = require('./application/bookings/createAppointment');
const ListMyVehicles = require('./application/vehicles/listvehicle'); // Dùng cho AppointmentController
const GetServiceSuggestions = require('./application/bookings/suggestion');
const ListServiceTypes = require('./application/bookings/listAllServiceType');
//const RespondToQuotation = require('./application/bookings/respondToQuotation');
const ListAppointmentHistory = require('./application/bookings/appointmentHistory');
const CancelAppointmentByCustomer = require('./application/bookings/cancelAppointmentByCustomer');

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
//staff - đặt lịch tại quầy
const SearchCustomer = require('./application/staff/searchCustomer');
const ListVehiclesForCustomer = require('./application/staff/listVehicleForCustomer');
const CreateCustomerByStaff = require('./application/staff/createCustomerByStaff');
const AddVehicleForCustomer = require('./application/staff/addVehicleForCustomer');
const CreateAndStartWalkInAppointment = require('./application/staff/createAppointmentAndStartWalkInAppointment');
const CancelAppointmentByStaff = require('./application/staff/cancelAppointmentByStaff');
//const ReviseQuotation = require('./application/staff/reviseQuotation'); // THÊM MỚI
//const HandoverVehicle = require('./application/staff/handoverVehicle');

// Technician Workflow
const ListTechnicianTasks = require('./application/technician/listTechnicianTask'); // (Đã cập nhật)
const CompleteTechnicianTask = require('./application/technician/completeTechnicianTask');
const TechnicianRequestParts = require('./application/technician/technicianRequestParts');
const AcceptTask = require('./application/technician/acceptTask'); // (THÊM MỚI)
const ListCompletedTasks = require('./application/technician/listCompletedTasks');
// --- INVENTORY FLOW (CẬP NHẬT MỚI) ---
const ViewInventory = require('./application/inventory/viewInventory');
const FindPartBySku = require('./application/inventory/findPartBySku');
const AddInventoryItem = require('./application/inventory/addInventoryItem');       // Mới
const UpdateInventoryItem = require('./application/inventory/updateInventoryItem'); // Mới
const RemoveInventoryItem = require('./application/inventory/removeInventoryItem');   // Mới
const ListLowStockItems = require('./application/inventory/listLowStockItems');       // Mới
const CreateRestockRequest = require('./application/inventory/createRestockRequest');
const ListRestockRequests = require('./application/inventory/ListRestockRequests');
const ProcessRestockRequest = require('./application/inventory/processRestockRequest');
const ImportRestock = require('./application/inventory/importRestock');
const GetInventoryItemDetails = require('./application/inventory/getInventoryItemDetails');

// quản lý trạm 
const ListStationStaff = require('./application/station/listStationStaff');
const UpdateStaffStatus = require('./application/station/updateStaffStatus');
const ListAllCertifications = require('./application/station/listAllCertifications');
const AssignCertification = require('./application/station/assignCertification');
const RevokeCertification = require('./application/station/revokeCertification');
const UpdateTechnicianSpecification = require('./application/station/updateTechnicianSpecification');
const GenerateStationRevenueReport = require('./application/station/generateStationRevenueReport');
const GenerateTechnicianPerformanceReport = require('./application/station/generateTechnicianPerformanceReport');  
const GetStaffDetails = require('./application/station/getStaffDetails');
const CreateCertification = require('./application/station/createCertification');
const UpdateCertification = require('./application/station/updateCertification');
const DeleteCertification = require('./application/station/deleteCertification');


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
//const quotationRepository = new PrismaQuotationRepository(prisma);
const paymentRepository = new PrismaPaymentRepository(prisma);  
const inventoryItemRepository = new PrismaInventoryItemRepository(prisma);
const partUsageRepository = new PrismaPartUsageRepository(prisma);
const restockRequestRepository = new PrismaRestockRequestRepository(prisma);
const partRepository = new PrismaPartRepository(prisma);
const maintenanceRecommendationRepository = new PrismaMaintenanceRecommendationRepository(prisma);
const technicianProfileRepository = new PrismaTechnicianProfileRepository(prisma); // (Repo đã được khai báo)
const certificationRepository = new PrismaCertificationRepository(prisma);
const staffCertificationRepository = new PrismaStaffCertificationRepository(prisma);
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
//quản lý xe
const addVehicleUseCase = new AddVehicle(vehicleRepository);
const viewVehiclesUseCase = new ViewVehicles(vehicleRepository);
const getVehicleDetailsUseCase = new GetVehicleDetails(vehicleRepository); 
const updateVehicleUseCase = new UpdateVehicle(vehicleRepository);       
const deleteVehicleUseCase = new DeleteVehicle(vehicleRepository); 
const listVehicleModelsUseCase = new ListVehicleModels(vehicleRepository); 
const listCompatibleBatteriesUseCase = new ListCompatibleBatteries(vehicleRepository); 
// --------------------------------------------------

//Usce Cases for Appointment Management
const createAppointmentUseCase = new CreateAppointment(
    appointmentRepository, 
    vehicleRepository, 
    serviceCenterRepository, 
    prisma);
const listMyVehiclesUseCase = new ListMyVehicles(vehicleRepository); // Dùng cho AppointmentController
const getServiceSuggestionsUseCase = new GetServiceSuggestions(maintenanceRecommendationRepository, vehicleRepository);
const listServiceTypesUseCase = new ListServiceTypes(serviceTypeRepository);
// const responseToQuotationUseCase = new RespondToQuotation(
//     appointmentRepository,
//     serviceRecordRepository,
//     prisma
// );
const listAppointmentHistoryUseCase = new ListAppointmentHistory(appointmentRepository);
const cancelAppointmentByCustomerUseCase = new CancelAppointmentByCustomer(appointmentRepository, serviceRecordRepository, prisma);
// luồng 2 đặt lịch tại quầy
const searchCustomerUseCase = new SearchCustomer(userRepository);
const listVehiclesForCustomerUseCase = new ListVehiclesForCustomer(vehicleRepository);
const createCustomerByStaffUseCase = new CreateCustomerByStaff(userRepository);
const addVehicleForCustomerUseCase = new AddVehicleForCustomer(vehicleRepository, userRepository);
const createAndStartWalkInAppointmentUseCase = new CreateAndStartWalkInAppointment(
    appointmentRepository,
    serviceRecordRepository,
    userRepository,
    serviceCenterRepository,
    vehicleRepository,
    prisma
);
const cancelAppointmentByStaffUseCase = new CancelAppointmentByStaff(appointmentRepository, serviceRecordRepository, prisma);
// const reviseQuotationUseCase = new ReviseQuotation(quotationRepository, 
//     appointmentRepository, 
//     serviceRecordRepository, 
//     prisma); 
//const handoverVehicleUseCase = new HandoverVehicle(appointmentRepository, serviceRecordRepository, invoiceRepository);

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
    //serviceRecordRepository,
    prisma // Truyền prisma client cho transaction
);
const createInvoiceUseCase = new CreateInvoice(
    invoiceRepository,
    // quotationRepository, // (ĐÃ XÓA)
    serviceRecordRepository,
    appointmentRepository,
    prisma // (THÊM THAM SỐ prisma VÀO CUỐI)
);
const recordCashPaymentUseCase = new RecordCashPayment(
    invoiceRepository,
    paymentRepository, // Chỉ cần 2 repo này
    prisma // Truyền prisma client cho transaction
);   
  
// Use Cases for Technician Management
const listTechnicianTasksUseCase = new ListTechnicianTasks(serviceRecordRepository);
// const submitDiagnosisUseCase = new SubmitDiagnosis(
//     serviceRecordRepository,
//     // quotationRepository,
//     appointmentRepository,
//     partRepository,        
//     partUsageRepository,   
//     prisma                 
// );
const completeTechnicianTaskUseCase = new CompleteTechnicianTask(
    serviceRecordRepository,
    appointmentRepository,
    prisma
);
const technicianRequestPartsUseCase = new TechnicianRequestParts(serviceRecordRepository, partRepository, partUsageRepository,inventoryItemRepository, prisma);
const acceptTaskUseCase = new AcceptTask(serviceRecordRepository); // (THÊM MỚI)
const listCompletedTasksUseCase = new ListCompletedTasks(serviceRecordRepository);
// Inventory (Luồng 3)
// Inventory (UPDATED INJECTION)
const viewInventoryUseCase = new ViewInventory(inventoryItemRepository);
const findPartBySkuUseCase = new FindPartBySku(inventoryItemRepository);
const addInventoryItemUseCase = new AddInventoryItem(partRepository, inventoryItemRepository, prisma);
const updateInventoryItemUseCase = new UpdateInventoryItem(
    inventoryItemRepository, 
    partRepository,
    restockRequestRepository, 
    prisma
);
const removeInventoryItemUseCase = new RemoveInventoryItem(inventoryItemRepository);
const listLowStockItemsUseCase = new ListLowStockItems(inventoryItemRepository);

const createRestockRequestUseCase = new CreateRestockRequest(restockRequestRepository, partRepository);
const listRestockRequestsUseCase = new ListRestockRequests(restockRequestRepository); // Dùng chung cho Admin/IM/Station
const processRestockRequestUseCase = new ProcessRestockRequest(restockRequestRepository);
const importRestockUseCase = new ImportRestock(restockRequestRepository, inventoryItemRepository, prisma);
const getInventoryItemDetailsUseCase = new GetInventoryItemDetails(inventoryItemRepository);

// quản lý trạm 
const listStationStaffUseCase = new ListStationStaff(userRepository);
const updateStaffStatusUseCase = new UpdateStaffStatus(userRepository);
const listAllCertificationsUseCase = new ListAllCertifications(certificationRepository);
const assignCertificationUseCase = new AssignCertification(
    staffCertificationRepository, 
    userRepository, 
    certificationRepository
);
const revokeCertificationUseCase = new RevokeCertification(
    staffCertificationRepository, 
    userRepository
);
const updateTechnicianSpecificationUseCase = new UpdateTechnicianSpecification(
    technicianProfileRepository, 
    userRepository
);
// --------------------------------------------------
const generateStationRevenueReportUseCase = new GenerateStationRevenueReport(invoiceRepository);
const generateTechnicianPerformanceReportUseCase = new GenerateTechnicianPerformanceReport(serviceRecordRepository);
const getStaffDetailsUseCase = new GetStaffDetails(userRepository);
const createCertificationUseCase = new CreateCertification(certificationRepository);
const updateCertificationUseCase = new UpdateCertification(certificationRepository);
const deleteCertificationUseCase = new DeleteCertification(
    certificationRepository,
    staffCertificationRepository 
);



// --- Khởi tạo Controllers và Routers ---

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
    viewVehiclesUseCase,
    getVehicleDetailsUseCase,
    updateVehicleUseCase,
    deleteVehicleUseCase,
    listVehicleModelsUseCase,
    listCompatibleBatteriesUseCase
);
// ----------------------------------------------------------

const appointmentController = new AppointmentController(
    createAppointmentUseCase,
    listMyVehiclesUseCase, // Dùng cho AppointmentController
    getServiceSuggestionsUseCase,
    listServiceTypesUseCase,
    getAppointmentDetailsUseCase, // Đây là use case chung
    // responseToQuotationUseCase,
    listAppointmentHistoryUseCase,
    cancelAppointmentByCustomerUseCase
);

const serviceCenterController = new ServiceCenterController(
    listAllServiceCentersUseCase,
    getAvailableSlotsUseCase
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
    //đặt lịch tại quầy
    searchCustomerUseCase,
    listVehiclesForCustomerUseCase,
    createCustomerByStaffUseCase,
    addVehicleForCustomerUseCase,
    createAndStartWalkInAppointmentUseCase,
    cancelAppointmentByStaffUseCase,
    //handoverVehicleUseCase
);
const technicianController = new TechnicianController(
    listTechnicianTasksUseCase,
    completeTechnicianTaskUseCase, 
    technicianRequestPartsUseCase, 
    viewInventoryUseCase,          
    findPartBySkuUseCase,          
    acceptTaskUseCase,             
    listCompletedTasksUseCase
);
const inventoryController = new InventoryController( 
    viewInventoryUseCase, 
    findPartBySkuUseCase, 
    addInventoryItemUseCase,      // 3
    updateInventoryItemUseCase, // 4
    removeInventoryItemUseCase,   // 5
    listLowStockItemsUseCase,     // 6
    createRestockRequestUseCase,  // 7
    listRestockRequestsUseCase,   // 8
    importRestockUseCase,         // 9
    processRestockRequestUseCase,  // 10 (Phê duyệt - dùng cho route Station Admin gọi qua controller này hoặc StationController)
    getInventoryItemDetailsUseCase
);
// quản lý trạm
const adminController = new AdminController( 
    listRestockRequestsUseCase,
    processRestockRequestUseCase
);
const stationController = new StationController(
    listStationStaffUseCase,
    updateStaffStatusUseCase,
    listAllCertificationsUseCase,
    assignCertificationUseCase,
    revokeCertificationUseCase,
    updateTechnicianSpecificationUseCase,
    generateStationRevenueReportUseCase,
    generateTechnicianPerformanceReportUseCase,
    getStaffDetailsUseCase,
    createCertificationUseCase,
    updateCertificationUseCase,
    deleteCertificationUseCase
);

initializePassport(passport, userRepository);

// Router
const authRouter = createAuthRouter(authController, passport);
const vehicleRouter = VehicleRouter(vehicleController); 
const appointmentRouterInstance = appointmentRouter(appointmentController);
const serviceCenterRouterInstance = serviceCenterRouter(serviceCenterController);
const staffRouterInstance = staffRouter(staffController);
const technicianRouterInstance = technicianRouter(technicianController);
const inventoryRouterInstance = inventoryRouter(inventoryController); 
const adminRouterInstance = adminRouter(adminController);
const stationRouterInstance = stationRouter(stationController);

// --- Gắn Router vào ứng dụng ---
app.use('/api/auth', authRouter);
app.use('/api/vehicle', vehicleRouter);
app.use('/api/appointments', appointmentRouterInstance);
app.use('/api/service-centers', serviceCenterRouterInstance);
app.use('/api/staff', staffRouterInstance);
app.use('/api/technician', technicianRouterInstance);
app.use('/api/inventory', inventoryRouterInstance); 
app.use('/api/admin', adminRouterInstance);
app.use('/api/station', stationRouterInstance);


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