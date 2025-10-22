# Hướng dẫn Seed Data vào PostgreSQL Server Độc lập

## 🎯 **Tổng quan**

Hướng dẫn này sẽ giúp bạn seed data vào PostgreSQL server đã deploy trên Render hoặc bất kỳ server nào khác.

## 🚀 **Cách 1: Seed Data Tự động (Khuyến nghị)**

### **Khi deploy lên Render:**
Render sẽ tự động chạy seed data trong quá trình build:

```yaml
# render.yaml
buildCommand: |
  npm install
  npx prisma generate
  npx prisma db push
  npm run db:init
```

### **Kết quả:**
- ✅ Database schema được tạo
- ✅ Seed data được thêm tự động
- ✅ Users, service centers, parts đã sẵn sàng

## 🔧 **Cách 2: Seed Data Manual**

### **Bước 1: Lấy Connection String**

#### **Từ Render Dashboard:**
1. Vào Render Dashboard
2. Chọn PostgreSQL service
3. Copy **External Database URL**
4. Format: `postgresql://username:password@host:port/database?sslmode=require`

#### **Từ Environment Variables:**
```bash
# Trong Render Web Service
echo $DATABASE_URL
```

### **Bước 2: Cấu hình Local Environment**

#### **Tạo file .env.local:**
```bash
# .env.local
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NODE_ENV=production
```

#### **Hoặc set trực tiếp:**
```bash
export DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### **Bước 3: Chạy Seed Script**

#### **Option A: Sử dụng npm script**
```bash
# Seed data vào remote database
npm run db:seed:remote
```

#### **Option B: Chạy trực tiếp**
```bash
# Set environment variable
export DATABASE_URL="your-connection-string"

# Chạy seed script
node scripts/remote-seed.js
```

#### **Option C: Sử dụng Prisma Studio**
```bash
# Mở Prisma Studio để quản lý data
npx prisma studio
```

## 🛠️ **Cách 3: Seed Data qua Render Console**

### **Bước 1: Vào Render Dashboard**
1. Chọn Web Service
2. Click **"Shell"** tab
3. Mở terminal

### **Bước 2: Chạy Commands**
```bash
# Trong Render Shell
npm run db:seed:remote
```

### **Bước 3: Verify Data**
```bash
# Check users
npx prisma studio

# Hoặc test API
curl https://your-app.onrender.com/health
```

## 📊 **Dữ liệu sẽ được tạo:**

### **Users:**
- 👤 **Admin:** admin@evservice.com / admin123
- 👨‍💼 **Station Admin:** station@evservice.com / station123
- 👨‍🔧 **Staff:** staff@evservice.com / staff123
- 🔧 **Technician:** tech@evservice.com / tech123
- 👤 **Customer:** customer@example.com / customer123

### **Service Center:**
- 🏢 EV Service Center Hồ Chí Minh
- 📍 123 Nguyễn Văn Cừ, Quận 5, TP.HCM

### **Service Types:**
- 🔧 Bảo dưỡng định kỳ
- 🔋 Sửa chữa pin
- ⚡ Kiểm tra hệ thống điện
- 🛞 Dịch vụ lốp
- 🚗 Hệ thống phanh

### **Parts & Inventory:**
- 📦 Lốp VinFast VF8 (4.5M VNĐ)
- 🔋 Nước làm mát pin (350K VNĐ)
- 🌬️ Lọc gió điều hòa (780K VNĐ)
- 🛑 Má phanh trước (2.1M VNĐ)

### **Vehicle & Appointment:**
- 🚗 VinFast VF8 (2023) - 51A-12345
- 📅 Appointment mẫu với 2 services

## 🔍 **Verify Seed Data**

### **1. Health Check:**
```bash
curl https://your-app.onrender.com/health
curl https://your-app.onrender.com/api/health/db
```

### **2. Test Login:**
```bash
# Admin login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evservice.com","password":"admin123"}'

# Customer login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'
```

### **3. API Documentation:**
- 📖 Swagger UI: `https://your-app.onrender.com/api-docs`

## 🚨 **Troubleshooting**

### **Lỗi Connection:**
```bash
# Kiểm tra connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### **Lỗi Permission:**
```bash
# Kiểm tra user permissions
npx prisma db push
```

### **Lỗi Duplicate Data:**
```bash
# Script sẽ hỏi có muốn xóa data cũ không
# Chọn 'y' để xóa và seed lại
```

### **Lỗi Network:**
```bash
# Kiểm tra firewall
# Kiểm tra SSL mode
# Kiểm tra host accessibility
```

## 🔄 **Reset Database**

### **Xóa tất cả data:**
```bash
# Chạy script với option reset
npm run db:seed:remote
# Chọn 'y' khi được hỏi xóa data cũ
```

### **Reset hoàn toàn:**
```bash
# Xóa schema và tạo lại
npx prisma db push --force-reset
npm run db:seed:remote
```

## 📈 **Monitoring**

### **Check Database Size:**
```sql
-- Trong PostgreSQL
SELECT pg_size_pretty(pg_database_size('your_database_name'));
```

### **Check Table Counts:**
```sql
-- Count records in each table
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables;
```

### **Check Connections:**
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;
```

## 🎯 **Best Practices**

### **1. Backup trước khi seed:**
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql
```

### **2. Test trên staging trước:**
```bash
# Sử dụng staging database
export DATABASE_URL="staging-connection-string"
npm run db:seed:remote
```

### **3. Monitor performance:**
```bash
# Check query performance
npx prisma studio
```

### **4. Use transactions:**
```javascript
// Script đã sử dụng transactions tự động
await prisma.$transaction(async (tx) => {
  // Seed operations
});
```

## ✅ **Checklist**

- [ ] Connection string đã đúng
- [ ] Environment variables đã set
- [ ] Database accessible
- [ ] Prisma client generated
- [ ] Seed script chạy thành công
- [ ] Health check pass
- [ ] Login test thành công
- [ ] API documentation accessible
