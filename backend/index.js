// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const connectDB = require('./config/db');

// const app = express();

// // Connect Database
// connectDB();

// // Middleware - CORS phải đặt trước tất cả routes
// app.use(cors({ 
//   origin: 'http://localhost:3000', 
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Serve static files với CORS headers
// app.use('/images', (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   next();
// }, express.static(path.join(__dirname, 'public/images')));

// app.use('/models', (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   next();
// }, express.static(path.join(__dirname, 'public/models')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/pets', require('./routes/pets'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/articles', require('./routes/articles'));
// app.use('/api/upload', require('./routes/uploadRoutes'));
// app.use('/ai', require('./routes/ai'));

// // Health check
// app.get('/', (req, res) => {
//   res.json({ message: 'FurEver API is running' });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!', error: err.message });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// ===========================
// 🔒 SECURITY MIDDLEWARE
// ===========================

// 1. Helmet - CHÚ Ý: Phải config đúng để KHÔNG CHẶN ẢNH
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // TẠM TẮT CSP vì nó chặn ảnh
}));

// 2. CORS
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit 100 requests per IP
  message: { error: 'Quá nhiều request, vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
  // QUAN TRỌNG: KHÔNG GIỚI HẠN CHO STATIC FILES
  skip: (req) => req.path.startsWith('/images') || req.path.startsWith('/models')
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login/register attempts
  skipSuccessfulRequests: true,
  message: { error: 'Quá nhiều lần đăng nhập sai, vui lòng thử lại sau 15 phút.' }
});

// Apply rate limiting CHỈ cho API routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Data sanitization - KHÔNG ẢNH HƯỞNG ĐẾN STATIC FILES
app.use(mongoSanitize());
app.use(xss());

// ===========================
// BODY PARSER
// ===========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================
// 🖼️ SERVE STATIC FILES (QUAN TRỌNG: ĐẶT SAU SECURITY MIDDLEWARE)
// ===========================
app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày
  next();
}, express.static(path.join(__dirname, 'public/images')));


app.use('/models', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
}, express.static(path.join(__dirname, 'public/models')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===========================
// API ROUTES
// ===========================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/ai', require('./routes/ai'));

// ===========================
// ROOT ROUTE
// ===========================
app.get('/', (req, res) => {
  res.json({ 
    message: 'FurEver API is running',
    version: '1.0.0',
    security: 'Enabled (Helmet, Rate Limiting, XSS Protection)'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===========================
// 🔒 ERROR HANDLING
// ===========================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File quá lớn! Tối đa 10MB.' });
  }
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy: Origin không được phép' });
  }
  
  // Generic error
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi máy chủ' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route không tồn tại',
    path: req.originalUrl 
  });
});

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 FurEver Server đang chạy`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Enabled`);
  console.log(`   ✓ Helmet (Cross-Origin Resource Policy)`);
  console.log(`   ✓ CORS Protection`);
  console.log(`   ✓ Rate Limiting (API only, skip static files)`);
  console.log(`   ✓ XSS Protection`);
  console.log(`   ✓ NoSQL Injection Protection`);
  console.log(`🖼️  Static Files: /images, /models`);
  console.log(`${'='.repeat(60)}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});