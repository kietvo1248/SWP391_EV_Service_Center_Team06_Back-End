# EV Service Center - Backend

## 1. Giới thiệu dự án (Project Introduction)

Đây là hệ thống backend cho **Phần mềm quản lý bảo dưỡng xe điện (EV Service Center Management System)**. Dự án được xây dựng nhằm mục đích cung cấp một giải pháp toàn diện để quản lý các hoạt động của một trung tâm dịch vụ và bảo dưỡng xe điện.

### Chức năng chính (Key Features)
*   Quản lý tài khoản khách hàng, nhân viên và quản trị viên.
*   Quản lý thông tin xe của khách hàng.
*   Đặt và theo dõi lịch hẹn dịch vụ.
*   Quản lý kho phụ tùng.
*   Xử lý hóa đơn và thanh toán.

---

## 2. Công nghệ sử dụng (Technologies Used)

Hệ thống được xây dựng trên nền tảng **Node.js** với các công nghệ hiện đại và hiệu quả:

*   **Framework:** [Express.js](https://expressjs.com/)
*   **Cơ sở dữ liệu (Database):** [PostgreSQL](https://www.postgresql.org/)
*   **ORM (Object-Relational Mapping):** [Prisma](https://www.prisma.io/)
*   **Xác thực (Authentication):** [JSON Web Tokens (JWT)](https://jwt.io/)
*   **Mã hóa mật khẩu (Password Hashing):** [bcryptjs](https://www.npmjs.com/package/bcryptjs)

---

## 3. Kiến trúc phần mềm (Software Architecture)

Dự án tuân thủ theo nguyên tắc của **Clean Architecture** nhằm mục đích xây dựng một hệ thống vững chắc, dễ bảo trì, dễ kiểm thử và không bị phụ thuộc vào các chi tiết kỹ thuật như framework hay cơ sở dữ liệu.

Kiến trúc được phân tách thành 4 tầng chính, với quy tắc phụ thuộc nghiêm ngặt: *các tầng bên trong không được biết về các tầng bên ngoài*.

1.  **Domain (Tầng lõi):** Chứa các `Entities` (Thực thể) và `Repositories` (Interfaces). Đây là nơi định nghĩa các quy tắc và đối tượng nghiệp vụ cốt lõi nhất của hệ thống, hoàn toàn độc lập với các tầng khác.
2.  **Application (Tầng ứng dụng):** Chứa các `Use Cases` (Trường hợp sử dụng). Đây là nơi điều phối luồng dữ liệu, thực thi logic nghiệp vụ cụ thể bằng cách sử dụng các đối tượng từ tầng Domain.
3.  **Infrastructure (Tầng hạ tầng):** Chứa các triển khai cụ thể cho các chi tiết kỹ thuật, chẳng hạn như `PrismaUserRepository` (triển khai Repository Interface bằng Prisma) hay các kết nối đến dịch vụ bên ngoài.
4.  **Interfaces (Tầng giao tiếp):** Là cổng giao tiếp với thế giới bên ngoài. Tầng này chứa các `Controllers`, `Routes`, và `Middlewares` để xử lý các yêu cầu HTTP, nhận dữ liệu đầu vào và trả về kết quả cho client.

### Sơ đồ luồng xử lý một yêu cầu (Request Flow)

```
Route -> Controller -> Use Case -> Repository (Interface) -> Prisma Repository -> Database
```

Việc áp dụng kiến trúc này đảm bảo rằng "bộ não" của ứng dụng (Domain và Application) có thể được tái sử dụng hoặc di chuyển sang một nền tảng khác mà không cần thay đổi.

---

## 4. Hướng dẫn cài đặt (Installation Guide)

### Cài đặt local development

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd SWP391_restApi_EV_Service_Center_Back-End_nodejs_postgre
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   # hoặc
   pnpm install
   ```

3. **Cấu hình environment variables:**
   ```bash
   cp env.example .env
   # Chỉnh sửa file .env với thông tin database và các biến môi trường khác
   ```

4. **Thiết lập database:**
   ```bash
   # Cài đặt PostgreSQL và tạo database
   # Xem hướng dẫn chi tiết: docs/DatabaseSetup.md
   
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Setup sample data
   npm run db:setup
   ```

5. **Khởi động server:**
   ```bash
   npm run dev
   ```

### Deploy lên Render

1. **Chuẩn bị repository:**
   - Đảm bảo code đã được push lên GitHub
   - Kiểm tra file `render.yaml` đã được cấu hình đúng

2. **Tạo tài khoản Render:**
   - Truy cập [render.com](https://render.com)
   - Đăng ký tài khoản và kết nối với GitHub

3. **Deploy database:**
   - Tạo PostgreSQL service từ dashboard Render
   - Lưu lại connection string

4. **Deploy web service:**
   - Tạo Web Service mới
   - Connect với GitHub repository
   - Cấu hình environment variables:
     - `DATABASE_URL`: Connection string từ PostgreSQL service
     - `JWT_SECRET`: Generate random string
     - `GOOGLE_CLIENT_ID`: Từ Google Cloud Console
     - `GOOGLE_CLIENT_SECRET`: Từ Google Cloud Console
     - `GOOGLE_CALLBACK_URL`: `https://your-app-name.onrender.com/api/auth/google/callback`

5. **Cấu hình Google OAuth:**
   - Vào Google Cloud Console
   - Thêm authorized redirect URI: `https://your-app-name.onrender.com/api/auth/google/callback`

## 5. Cách sử dụng API (API Usage)

### API Documentation
- **Swagger UI:** `http://localhost:3000/api-docs` (local)
- **Production:** `https://your-app-name.onrender.com/api-docs`

### Endpoints chính:
- **Authentication:** `/api/auth/*`
- **Vehicles:** `/api/vehicles/*`
- **Appointments:** `/api/appointments/*`
- **Service Centers:** `/api/service-centers/*`

---

## English Version

### 1. Project Introduction

This is the backend system for the **EV Service Center Management System**. The project aims to provide a comprehensive solution for managing the operations of an electric vehicle service and maintenance center.

#### Key Features
*   Manage customer, staff, and administrator accounts.
*   Manage customer vehicle information.
*   Book and track service appointments.
*   Manage parts inventory.
*   Handle invoices and payments.

### 2. Technologies Used

The system is built on the **Node.js** platform using modern and efficient technologies:

*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **ORM (Object-Relational Mapping):** Prisma
*   **Authentication:** JSON Web Tokens (JWT)
*   **Password Hashing:** bcryptjs

### 3. Software Architecture

The project adheres to the principles of **Clean Architecture** to build a robust, maintainable, testable system that is not dependent on technical details like frameworks or databases.

The architecture is divided into 4 main layers with a strict dependency rule: *inner layers must not know about outer layers*.

1.  **Domain (Core Layer):** Contains `Entities` and `Repository Interfaces`. This is where the core business rules and objects of the system are defined, completely independent of other layers.
2.  **Application (Application Layer):** Contains `Use Cases`. This layer orchestrates data flow and executes specific business logic using objects from the Domain layer.
3.  **Infrastructure (Infrastructure Layer):** Contains concrete implementations of technical details, such as `PrismaUserRepository` (implementing the Repository Interface with Prisma) or connections to external services.
4.  **Interfaces (Interface Layer):** The gateway to the outside world. This layer contains `Controllers`, `Routes`, and `Middlewares` to handle HTTP requests, receive input, and return results to the client.

#### Request Flow

```
Route -> Controller -> Use Case -> Repository (Interface) -> Prisma Repository -> Database
```

Applying this architecture ensures that the "brain" of the application (Domain and Application) can be reused or migrated to another platform without modification.