# Hướng dẫn cấu hình Google OAuth

## 1. Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google+ API
4. Vào "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Chọn "Web application"
6. Thêm Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (cho development)
   - `https://yourdomain.com/api/auth/google/callback` (cho production)

## 2. Cấu hình Environment Variables

Tạo file `.env` trong root directory với nội dung:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ev_service_center"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-from-google-console"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-google-console"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Email Configuration (for password reset)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## 3. API Endpoints

### Bắt đầu Google OAuth
```
GET /api/auth/google
```
Điều hướng người dùng đến Google để xác thực.

### Callback sau khi Google xác thực
```
GET /api/auth/google/callback
```
Google sẽ gọi endpoint này sau khi người dùng xác thực thành công.

**Response thành công:**
```json
{
  "message": "Google authentication successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "fullName": "User Name",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

## 4. Luồng hoạt động

1. **Người dùng click "Đăng nhập bằng Google"** → Gọi `GET /api/auth/google`
2. **Hệ thống điều hướng đến Google** → Người dùng đăng nhập trên Google
3. **Google gọi callback** → `GET /api/auth/google/callback`
4. **Hệ thống xử lý:**
   - Tìm user bằng Google ID
   - Nếu không có, tìm bằng email
   - Nếu vẫn không có, tạo user mới
   - Tạo JWT token
   - Trả về thông tin user và token

## 5. Frontend Integration

```javascript
// Đăng nhập bằng Google
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:3000/api/auth/google';
};

// Xử lý callback (nếu cần)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  localStorage.setItem('token', token);
  // Redirect to dashboard
}
```

## 6. Troubleshooting

### Lỗi thường gặp:

1. **"Invalid redirect URI"**
   - Kiểm tra GOOGLE_CALLBACK_URL trong .env
   - Đảm bảo redirect URI trong Google Console khớp với GOOGLE_CALLBACK_URL

2. **"Client ID not found"**
   - Kiểm tra GOOGLE_CLIENT_ID trong .env
   - Đảm bảo đã copy đúng từ Google Console

3. **"Database connection error"**
   - Kiểm tra DATABASE_URL
   - Đảm bảo database đã được migrate

### Kiểm tra cấu hình:

```bash
# Kiểm tra environment variables
node -e "console.log(process.env.GOOGLE_CLIENT_ID)"

# Test database connection
npx prisma db push

# Test Google OAuth flow
curl http://localhost:3000/api/auth/google
```
