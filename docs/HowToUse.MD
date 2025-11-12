# 🚗 EV Service Center Backend

Tài liệu hướng dẫn cài đặt, cấu hình và khởi chạy hệ thống **Trung tâm Dịch vụ Xe điện (EV Service Center)** — Backend API.

---

## 🧩 1. Yêu cầu Môi trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy của bạn đã cài đặt các phần mềm sau:

- **Node.js**: Phiên bản **v18.x** hoặc mới hơn  
- **pnpm**: Trình quản lý gói thay thế npm  
  👉 Cài đặt bằng lệnh:
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL**: Cần có **một server PostgreSQL** đang hoạt động

---

## ⚙️ 2. Các bước Cài đặt

### 🪜 Bước 2.1: Tải mã nguồn

Clone repository hoặc tải mã nguồn về máy:

```bash
git clone <your-repository-url>
cd SWP391_EV_Maitenance_service_BackEnd
```

### 📦 Bước 2.2: Cài đặt Dependencies

Cài đặt tất cả thư viện cần thiết:

```bash
pnpm install
```

---

## 🔐 3. Cấu hình Môi trường (.env)

Tạo file tên là `.env` trong thư mục gốc của dự án và thêm các giá trị cấu hình theo mẫu sau:

```bash
# 1. Cấu hình CSDL PostgreSQL
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/ev_service_db?schema=public"

# 2. JSON Web Token (JWT)
JWT_SECRET="your_super_secret_jwt_key"

# 3. Google OAuth 2.0 (Passport)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 4. Express Session
SESSION_SECRET="your_super_secret_session_key"

# 5. Nodemailer (Quên mật khẩu)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
```

> 💡 **Lưu ý:**  
> Đối với Google OAuth, bạn cần đăng ký URL sau trong phần “Authorized redirect URIs” trên [Google Cloud Console](https://console.cloud.google.com/):  
> ```
> http://localhost:5000/api/auth/google/callback
> ```

---

## 🗄️ 4. Thiết lập Cơ sở Dữ liệu

Để Prisma tạo và áp dụng migration, hãy chạy:

```bash
pnpm prisma migrate dev
```

Lệnh này sẽ đồng bộ schema trong Prisma với cơ sở dữ liệu PostgreSQL của bạn.

---

## 📘 5. Thiết lập Swagger (Tài liệu & Kiểm thử API)

### ⚙️ Bước 5.1: Cài đặt thư viện

Nếu chưa có, cài đặt thêm Swagger UI:

```bash
pnpm add swagger-ui-express yamljs
```

### 🚀 Bước 5.2: Chạy Ứng dụng

Khởi động server ở chế độ phát triển:

```bash
pnpm run dev
```

Server sẽ chạy tại địa chỉ:

```
http://localhost:6969
```

### 🌐 Bước 5.3: Truy cập Swagger UI

Mở trình duyệt và truy cập:

```
http://localhost:6969/api-docs
```

> Dự án được cấu hình để tự động tải tài liệu từ file `swagger.yaml` tại thư mục gốc.

---

## 🧮 6. (Tùy chọn) Tạo Dữ liệu Mẫu

Nếu bạn muốn khởi tạo dữ liệu mẫu để kiểm thử:

```bash
pnpm db:seed
```

Nếu bạn muốn dọn sạch dữ liệu mẫu đ:

```bash
pnpm prisma migrate reset
```

---

## ✅ Hoàn tất

Nếu bạn đã làm đúng các bước trên, backend của bạn đã sẵn sàng hoạt động 🎉  
Bạn có thể kết nối frontend hoặc Postman để thử các API được mô tả trong Swagger.

---

### 🧠 Gợi ý thêm
- Kiểm tra lại kết nối DB nếu Prisma báo lỗi.
- Kiểm tra biến môi trường `.env` được định dạng đúng.
- Dùng `pnpm build` nếu cần build cho môi trường production.

---

**© EV Service Center Project — 2025**
