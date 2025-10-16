require('dotenv').config();

// Import ứng dụng đã được cấu hình từ app.js
const app = require('./src/app');
const port = process.env.PORT || 3000;

// Khởi động server và lắng nghe trên cổng đã chỉ định
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});