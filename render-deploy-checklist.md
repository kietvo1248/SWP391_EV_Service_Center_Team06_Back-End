# ✅ Render Deploy Checklist

## Trước khi Deploy

### 1. Code Preparation
- [ ] Code đã được push lên GitHub
- [ ] File `render.yaml` đã được tạo và cấu hình
- [ ] File `Dockerfile` đã được tạo
- [ ] File `env.example` đã được tạo
- [ ] Health check endpoints đã được thêm (`/health`, `/api/health/db`)
- [ ] Package.json scripts đã được cập nhật

### 2. Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Random secret key
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `GOOGLE_CLIENT_ID` - Từ Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - Từ Google Cloud Console
- [ ] `GOOGLE_CALLBACK_URL` - Production callback URL
- [ ] Email configuration (optional)

### 3. Google OAuth Setup
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 credentials created
- [ ] Authorized redirect URIs configured:
  - `http://localhost:3000/api/auth/google/callback` (development)
  - `https://your-app-name.onrender.com/api/auth/google/callback` (production)
- [ ] Client ID và Client Secret đã được lưu

## Deploy Process

### 4. Render Setup
- [ ] Tài khoản Render đã được tạo
- [ ] GitHub account đã được connect
- [ ] PostgreSQL service đã được tạo
- [ ] Web service đã được tạo
- [ ] Environment variables đã được cấu hình

### 5. Database Setup
- [ ] PostgreSQL service running
- [ ] Connection string đã được copy
- [ ] Database migrations đã được chạy
- [ ] Production seed data đã được tạo tự động
- [ ] Test users đã được tạo (admin, staff, customer)
- [ ] Service center và service types đã có

### 6. Testing
- [ ] Health check endpoint: `GET /health`
- [ ] Database health: `GET /api/health/db`
- [ ] API documentation: `GET /api-docs`
- [ ] Authentication endpoints working
- [ ] Google OAuth flow working
- [ ] Test login với production users:
  - [ ] Admin: admin@evservice.com / admin123
  - [ ] Staff: staff@evservice.com / staff123
  - [ ] Customer: customer@example.com / customer123
- [ ] Service center data có sẵn
- [ ] Vehicle và appointment mẫu đã tạo

## Post-Deploy

### 7. Monitoring
- [ ] Render dashboard monitoring
- [ ] Logs được check
- [ ] Performance metrics
- [ ] Error rates monitoring

### 8. Security
- [ ] HTTPS enabled (auto by Render)
- [ ] Environment variables secure
- [ ] Database connections secure
- [ ] CORS configured properly

### 9. Documentation
- [ ] API documentation accessible
- [ ] Health check endpoints working
- [ ] Deployment guide updated
- [ ] README updated with production URLs

## Troubleshooting

### Common Issues
- [ ] Database connection errors
- [ ] Environment variables not set
- [ ] Google OAuth redirect URI mismatch
- [ ] Build failures
- [ ] Memory issues

### Solutions
- [ ] Check Render logs
- [ ] Verify environment variables
- [ ] Test locally first
- [ ] Check Google Console configuration
- [ ] Monitor resource usage

## Production Checklist

### Performance
- [ ] Response times < 2s
- [ ] Database queries optimized
- [ ] Memory usage stable
- [ ] No memory leaks

### Security
- [ ] All endpoints protected
- [ ] Input validation working
- [ ] Rate limiting configured
- [ ] CORS properly set

### Reliability
- [ ] Health checks passing
- [ ] Error handling working
- [ ] Logging configured
- [ ] Monitoring active

## Cost Optimization

### Free Tier Management
- [ ] Web service sleep mode configured
- [ ] Database usage monitored
- [ ] Bandwidth usage tracked
- [ ] Resource optimization applied

### Scaling Considerations
- [ ] Database connection pooling
- [ ] Caching strategies
- [ ] CDN usage (if needed)
- [ ] Load balancing (future)

## Maintenance

### Regular Tasks
- [ ] Dependency updates
- [ ] Security patches
- [ ] Performance monitoring
- [ ] Backup verification
- [ ] Log rotation
- [ ] Health check monitoring

### Monitoring Alerts
- [ ] Uptime monitoring
- [ ] Error rate alerts
- [ ] Performance alerts
- [ ] Resource usage alerts
- [ ] Database connection alerts
