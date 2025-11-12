# 🚗 EV Service Center Backend

Tài liệu hướng dẫn cài đặt, cấu hình, khởi chạy và sử dụng Prisma ORM cho hệ thống **Trung tâm Dịch vụ Xe điện (EV Service Center)** — Backend API.

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
> Đối với Google OAuth, bạn cần đăng ký URL sau trong phần "Authorized redirect URIs" trên [Google Cloud Console](https://console.cloud.google.com/):  
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
pnpm dev
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

---

## 📚 7. Prisma ORM - Hàm thường dùng

Prisma là ORM (Object-Relational Mapping) giúp giao tiếp với database một cách an toàn và dễ dàng.

### 📌 Setup Prisma Client

Trong các file controller hoặc service, import Prisma Client:

```javascript
import { PrismaClient } from '@prisma/client';
// hoặc nếu đã có file config:
import prisma from '@/generated/prisma/index.js';

const prisma = new PrismaClient();
```

---

### 1️⃣ CREATE - Tạo dữ liệu

```javascript
// Tạo 1 user mới
const newUser = await prisma.user.create({
  data: {
    email: 'john@example.com',
    password: 'hashed_password',
    fullName: 'John Doe',
    phone: '0123456789',
    role: 'USER'
  }
});

// Tạo user kèm vehicle (relation)
const userWithVehicle = await prisma.user.create({
  data: {
    email: 'jane@example.com',
    password: 'hashed_password',
    fullName: 'Jane Doe',
    vehicles: {
      create: {
        licensePlate: 'ABC123',
        brand: 'Tesla',
        model: 'Model 3'
      }
    }
  },
  include: {
    vehicles: true  // Trả về cả vehicles
  }
});
```

---

### 2️⃣ READ - Đọc dữ liệu

```javascript
// Lấy 1 user theo ID
const user = await prisma.user.findUnique({
  where: { id: 'user-uuid-here' }
});

// Lấy 1 user theo email
const userByEmail = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});

// Lấy tất cả users
const allUsers = await prisma.user.findMany();

// Lấy users với điều kiện
const activeUsers = await prisma.user.findMany({
  where: {
    isActive: true,
    role: 'USER'
  }
});

// Lấy với phân trang
const paginatedUsers = await prisma.user.findMany({
  skip: 0,      // Bỏ qua bao nhiêu bản ghi
  take: 10,     // Lấy bao nhiêu bản ghi
  orderBy: {
    createdAt: 'desc'  // Sắp xếp mới nhất trước
  }
});

// Lấy user với vehicles (relation)
const userWithVehicles = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    vehicles: true,
    appointments: true
  }
});

// Lấy user cùng vehicles active (điều kiện lồng)
const userWithActiveVehicles = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    vehicles: {
      where: { isActive: true }  // Chỉ vehicles active
    }
  }
});

// Đếm tổng số users
const userCount = await prisma.user.count();

// Đếm users active
const activeCount = await prisma.user.count({
  where: { isActive: true }
});
```

---

### 3️⃣ UPDATE - Cập nhật dữ liệu

```javascript
// Cập nhật 1 user
const updatedUser = await prisma.user.update({
  where: { id: 'user-id' },
  data: {
    fullName: 'John Updated',
    phone: '9876543210'
  }
});

// Cập nhật nhiều users
const updatedCount = await prisma.user.updateMany({
  where: { role: 'GUEST' },
  data: { isActive: false }  // Vô hiệu tất cả GUEST
});

// Upsert (cập nhật nếu tồn tại, nếu không thì tạo mới)
const user = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { fullName: 'John Updated' },
  create: {
    email: 'john@example.com',
    fullName: 'John Doe',
    password: 'hashed_password',
    role: 'USER'
  }
});
```

---

### 4️⃣ DELETE - Xóa dữ liệu

```javascript
// Xóa 1 user
const deletedUser = await prisma.user.delete({
  where: { id: 'user-id' }
});

// Xóa nhiều users
const deletedCount = await prisma.user.deleteMany({
  where: { role: 'GUEST' }
});

// ⚠️ Xóa tất cả (cẩn thận!)
await prisma.user.deleteMany({});
```

---

### 5️⃣ RELATIONS - Quan hệ (1-to-many, many-to-many)

```javascript
// Lấy user + vehicles + appointments
const fullUserData = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    vehicles: {
      select: {
        id: true,
        licensePlate: true,
        brand: true
      }
    },
    appointments: true
  }
});

// Lấy vehicle + owner user
const vehicleWithOwner = await prisma.vehicle.findUnique({
  where: { id: 'vehicle-id' },
  include: {
    user: true  // Lấy user sở hữu
  }
});

// Tạo appointment liên kết user, vehicle, service type
const newAppointment = await prisma.serviceAppointment.create({
  data: {
    appointmentDate: new Date('2025-12-01'),
    status: 'PENDING',
    userId: 'user-id',
    vehicleId: 'vehicle-id',
    serviceTypeId: 'service-type-id',
    description: 'Bảo dưỡng định kỳ'
  },
  include: {
    user: true,
    vehicle: true,
    serviceType: true
  }
});
```

---

### 6️⃣ FILTERS - Các điều kiện tìm kiếm

```javascript
// NOT - Không bằng
const inactiveUsers = await prisma.user.findMany({
  where: {
    isActive: { not: true }
  }
});

// IN - Trong danh sách
const specificUsers = await prisma.user.findMany({
  where: {
    id: { in: ['id1', 'id2', 'id3'] }
  }
});

// CONTAINS - Chứa (tìm kiếm)
const usersWithDoe = await prisma.user.findMany({
  where: {
    fullName: { contains: 'Doe', mode: 'insensitive' }
  }
});

// STARTSWITH / ENDSWITH
const usersWithJ = await prisma.user.findMany({
  where: {
    fullName: { startsWith: 'J' }
  }
});

// GT, GTE, LT, LTE (so sánh)
const recentUsers = await prisma.user.findMany({
  where: {
    createdAt: { gte: new Date('2025-01-01') }  // >= 2025-01-01
  }
});

// AND, OR
const complexFilter = await prisma.user.findMany({
  where: {
    AND: [
      { isActive: true },
      { role: 'USER' }
    ]
  }
});
```

---

### 7️⃣ AGGREGATION - Tổng hợp dữ liệu

```javascript
// Đếm, tính trung bình, min, max
const stats = await prisma.user.aggregate({
  _count: true,  // Tổng số user
  _avg: { id: true }
});

// Group by - Nhóm theo status
const appointmentStats = await prisma.serviceAppointment.groupBy({
  by: ['status'],
  _count: true
});
// Kết quả: [{status: 'PENDING', _count: 5}, {status: 'COMPLETED', _count: 3}]

// Min/Max ngày
const vehicleStats = await prisma.vehicle.aggregate({
  _count: true,
  _min: { createdAt: true },
  _max: { createdAt: true }
});
```

---

### 8️⃣ TRANSACTION - Giao dịch (nhiều thao tác cùng lúc)

```javascript
// Tạo user và vehicle trong 1 transaction
try {
  const [newUser, newVehicle] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashed',
        role: 'USER'
      }
    }),
    prisma.vehicle.create({
      data: {
        licensePlate: 'XYZ789',
        brand: 'BMW',
        model: '3 Series',
        userId: 'user-id'
      }
    })
  ]);
  // Nếu cả 2 thành công = commit, 1 lỗi = rollback tất
} catch (error) {
  console.error('Transaction failed:', error);
}
```

---

### 9️⃣ RAW QUERIES - SQL trực tiếp

```javascript
// Chỉ dùng khi Prisma không đủ
const result = await prisma.$queryRaw`
  SELECT u.id, u.fullName, COUNT(v.id) as vehicleCount
  FROM "User" u
  LEFT JOIN "Vehicle" v ON u.id = v.userId
  GROUP BY u.id
`;
```

---

## 🛠️ Lệnh Prisma hữu ích

```bash
# Mở Prisma Studio (GUI để xem/chỉnh sửa dữ liệu)
pnpm prisma studio

# Kiểm tra schema Prisma có lỗi không
pnpm prisma validate

# Format lại file schema.prisma
pnpm prisma format

# Tạo migration mới (không chạy)
pnpm prisma migrate create --name migration_name

# Áp dụng pending migrations
pnpm prisma migrate deploy

# Reset database (xóa tất cả, chạy lại migrations)
pnpm prisma migrate reset

# Xem migration status
pnpm prisma migrate status

# Generate Prisma Client
pnpm prisma generate
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
- Tham khảo [Prisma Documentation](https://www.prisma.io/docs/) để biết thêm chi tiết.

---

**© EV Service Center Project — 2025**
