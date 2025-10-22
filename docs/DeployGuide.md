# Hướng dẫn Deploy lên Render

## 1. Chuẩn bị

### Yêu cầu hệ thống
- Tài khoản GitHub
- Tài khoản Render (miễn phí)
- Tài khoản Google Cloud Console (cho OAuth)

### Files cần thiết
- ✅ `render.yaml` - Cấu hình Render services
- ✅ `Dockerfile` - Container configuration
- ✅ `env.example` - Environment variables template
- ✅ `package.json` - Scripts và dependencies

## 2. Cấu hình Render

### Bước 1: Tạo tài khoản Render
1. Truy cập [render.com](https://render.com)
2. Đăng ký tài khoản
3. Kết nối với GitHub account

### Bước 2: Tạo PostgreSQL Database
1. Vào Dashboard → "New +" → "PostgreSQL"
2. Cấu hình:
   - **Name:** `ev-service-center-db`
   - **Plan:** Free
   - **Region:** Singapore (gần Việt Nam nhất)
3. Lưu lại **Connection String**

### Bước 3: Tạo Web Service
1. Vào Dashboard → "New +" → "Web Service"
2. Connect GitHub repository
3. Cấu hình:
   - **Name:** `ev-service-center-api`
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`

### Bước 4: Environment Variables
Thêm các biến môi trường sau:

```bash
# Database
DATABASE_URL=<connection-string-from-postgresql-service>

# Server
NODE_ENV=production
PORT=10000

# JWT
JWT_SECRET=<generate-random-string>

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASS=<app-password>
```

## 3. Cấu hình Google OAuth

### Bước 1: Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API

### Bước 2: Tạo OAuth Credentials
1. Vào "APIs & Services" → "Credentials"
2. "Create Credentials" → "OAuth client ID"
3. Cấu hình:
   - **Application type:** Web application
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://your-app-name.onrender.com/api/auth/google/callback` (production)

### Bước 3: Lấy Credentials
- Copy **Client ID** và **Client Secret**
- Thêm vào Render environment variables

## 4. Deploy Process

### Automatic Deploy
1. Push code lên GitHub
2. Render sẽ tự động detect và deploy
3. Kiểm tra logs trong Render dashboard

### Manual Deploy
```bash
# Local testing
npm run build
npm start

# Check health
curl https://your-app-name.onrender.com/health
```

## 5. Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database
```

#### Build Failed
```bash
# Check Node.js version
node --version  # Should be 18+

# Check dependencies
npm install
npx prisma generate
```

#### OAuth Error
- Kiểm tra GOOGLE_CALLBACK_URL
- Đảm bảo redirect URI đã được thêm vào Google Console
- Check GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET

### Logs và Monitoring
1. Vào Render Dashboard
2. Chọn service
3. Tab "Logs" để xem real-time logs
4. Tab "Metrics" để monitor performance

## 6. Production Checklist

- [ ] Database connection working
- [ ] Environment variables set
- [ ] Google OAuth configured
- [ ] API endpoints responding
- [ ] Swagger docs accessible
- [ ] Health check endpoint working
- [ ] SSL certificate active (auto by Render)

## 7. Cost Optimization

### Free Tier Limits
- **Web Service:** 750 hours/month
- **PostgreSQL:** 1GB storage
- **Bandwidth:** 100GB/month

### Tips
- Sử dụng sleep mode cho development
- Optimize database queries
- Enable caching where possible
- Monitor usage trong dashboard

## 8. Security Best Practices

1. **Environment Variables:**
   - Không commit `.env` files
   - Sử dụng strong JWT secrets
   - Rotate credentials regularly

2. **Database:**
   - Enable SSL connections
   - Use connection pooling
   - Regular backups

3. **API Security:**
   - Rate limiting
   - Input validation
   - CORS configuration
   - Authentication middleware

## 9. Monitoring và Maintenance

### Health Checks
```bash
# API Health
GET https://your-app-name.onrender.com/health

# Database Health
GET https://your-app-name.onrender.com/api/health/db
```

### Performance Monitoring
- Response times
- Error rates
- Database connections
- Memory usage

### Regular Maintenance
- Update dependencies
- Monitor logs
- Check database performance
- Review security settings
