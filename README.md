# Bản tin Sinh viên 5 Tốt — Khoa Tâm lý học

Website quản lý và đăng bản tin phong trào Sinh viên 5 Tốt cho sinh viên trong khoa.

---

## Cấu trúc thư mục

```
sv5tot/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Đăng nhập, đổi mật khẩu
│   │   │   ├── posts.controller.js       # CRUD bài viết + views_count
│   │   │   └── misc.controller.js        # Students, documents, categories, upload, dashboard
│   │   ├── middlewares/
│   │   │   ├── auth.js                   # JWT authenticate, requireAdmin, optionalAuth
│   │   │   └── upload.js                 # Multer S3 - upload ảnh & tài liệu
│   │   ├── routes/
│   │   │   └── index.js                  # Tất cả API endpoints
│   │   ├── db/
│   │   │   ├── index.js                  # PostgreSQL connection pool + helpers
│   │   │   ├── migrate.js                # Tạo toàn bộ schema (chạy 1 lần)
│   │   │   └── seed.js                   # Dữ liệu mẫu ban đầu
│   │   └── index.js                      # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── PublicLayout.jsx       # Navbar + Footer cho trang public
    │   │       └── AdminLayout.jsx        # Sidebar admin
    │   ├── pages/
    │   │   ├── HomePage.jsx               # Trang chủ
    │   │   ├── BanTinPage.jsx             # Danh sách bài viết + filter
    │   │   ├── PostDetailPage.jsx         # Chi tiết bài viết
    │   │   ├── GuongMatPage.jsx           # Gương mặt tiêu biểu
    │   │   ├── TaiLieuPage.jsx            # Tài liệu & tiêu chuẩn
    │   │   └── admin/
    │   │       ├── LoginPage.jsx          # Trang đăng nhập admin
    │   │       ├── DashboardPage.jsx      # Dashboard thống kê
    │   │       ├── PostsPage.jsx          # Quản lý bài viết (list + form)
    │   │       └── ManagePage.jsx         # Quản lý students + documents
    │   ├── services/
    │   │   └── api.js                     # Axios instance + tất cả API calls
    │   ├── store/
    │   │   └── authStore.js               # Zustand auth state
    │   ├── App.jsx                        # Router chính + protected routes
    │   ├── index.js
    │   └── index.css                      # Tailwind + prose styles
    ├── tailwind.config.js
    └── package.json
```

---

## Cài đặt & chạy

### 1. Backend

```bash
cd backend
cp .env.example .env
# Điền đủ các biến trong .env

npm install

# Tạo database schema
npm run db:migrate

# Seed dữ liệu mẫu
npm run db:seed

# Chạy development
npm run dev
```

Backend chạy tại: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend chạy tại: `http://localhost:3000`

---

## API Endpoints chính

### Public
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/posts` | Danh sách bài viết (có filter: `?category=ban-tin&page=1&search=`) |
| GET | `/api/posts/:slug` | Chi tiết bài viết + tăng views_count |
| GET | `/api/categories` | Danh sách danh mục (kèm post_count) |
| GET | `/api/featured-students` | Sinh viên tiêu biểu |
| GET | `/api/documents` | Tài liệu (có filter: `?category=tieu-chuan`) |

### Admin (cần JWT)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/admin/posts` | Tất cả bài viết (cả draft) |
| POST | `/api/admin/posts` | Tạo bài viết mới |
| PUT | `/api/admin/posts/:id` | Sửa bài viết |
| DELETE | `/api/admin/posts/:id` | Xóa bài viết (admin only) |
| POST | `/api/admin/upload/image` | Upload ảnh → Object Storage |
| POST | `/api/admin/upload/document` | Upload PDF/DOCX → Object Storage |
| GET | `/api/admin/dashboard` | Thống kê dashboard |

---

## Tài khoản mặc định (sau seed)

- **Email:** `admin@sv5tot.edu.vn`  
- **Mật khẩu:** `Admin@123`

> Đổi mật khẩu ngay sau khi deploy!

---

## Database schema tóm tắt

| Bảng | Ghi chú |
|------|---------|
| `users` | Admin / Editor, JWT auth |
| `categories` | Danh mục bài viết và tài liệu |
| `posts` | Bài viết, có `views_count`, `status` (draft/published) |
| `tags` + `post_tags` | Tag nhiều-nhiều với posts |
| `featured_students` | Gương mặt SV5T tiêu biểu |
| `documents` | Tài liệu PDF/DOCX, có `category_id` |
| `banners` | Ảnh banner trang chủ |

---

## Triển khai (Deployment)

**Miễn phí cho ~100 người dùng:**

| Thành phần | Dịch vụ gợi ý |
|-----------|--------------|
| Frontend | Vercel / Netlify |
| Backend + DB | Railway (free tier) |
| Object Storage | Supabase Storage (1GB free) |

```bash
# Build frontend
cd frontend && npm run build

# Railway: kết nối GitHub repo, set biến môi trường trong dashboard
# Vercel: import project, set REACT_APP_API_URL=https://your-railway-app.railway.app
```
