require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security middlewares ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting - giới hạn 100 request/phút cho public API
const limiter = rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true });
app.use('/api', limiter);

// ─── Request parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Endpoint không tồn tại' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (err.message?.includes('Loại file không được hỗ trợ')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Lỗi server nội bộ' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📦 Môi trường: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
