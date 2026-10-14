# ☕ Website Quản Lý Quán Cà Phê (QLCafe)

Hệ thống Website quản lý quán cà phê full-stack, bao gồm **Backend REST API**, **Frontend SPA** và **Trợ lý ảo AI** tích hợp phân tích kinh doanh. Hỗ trợ triển khai production trên **Render.com** (Backend) và **Vercel** (Frontend).

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| **Frontend** | Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4, Shadcn/ui, TanStack Query v5, Zustand, React Hook Form + Zod, Chart.js, Lucide React |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Security (JWT + Google OAuth2), Spring Data JPA, Lombok, Cloudinary SDK |
| **Database** | SQL Server (Somee.com cho production) |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **Tooling** | pnpm (Frontend), Maven (Backend), Biome (Lint + Format), TypeScript (`tsc --noEmit`) |
| **Deploy** | Docker (Backend), Render.com (Backend), Vercel (Frontend) |

---

## 📁 Cấu trúc thư mục gốc

```
Web QLCafe/
├── backend/          # Spring Boot REST API
├── frontend/         # Next.js SPA
├── database/         # SQL scripts khởi tạo Database
│   ├── init.sql      # Script gốc (local dev)
│   └── init-db.sql   # Script production (Somee.com)
├── uploads/          # Ảnh sản phẩm upload local (dev)
└── README.md
```

---

## 📂 Cấu trúc Frontend (`frontend/src/`)

```
src/
├── app/                        # Next.js App Router — Pages
│   ├── login/                  # Đăng nhập (Username/Password + Google OAuth2)
│   ├── dashboard/              # Bảng điều khiển thống kê doanh thu
│   ├── products/               # Quản lý sản phẩm (CRUD + upload ảnh Cloudinary)
│   ├── tables/                 # Quản lý sơ đồ bàn
│   ├── orders/                 # POS — Gọi món & Thanh toán (Admin)
│   ├── staff-orders/           # POS cho nhân viên (Staff)
│   ├── order-history/          # Lịch sử đơn hàng
│   ├── accounts/               # Quản lý tài khoản (Admin)
│   ├── ai-assistant/           # Trợ lý ảo AI phân tích kinh doanh
│   └── api/chat/route.ts       # API Route trung gian gọi Google Gemini
├── components/
│   ├── auth/                   # GoogleSignInButton
│   ├── layout/                 # Sidebar, Navbar, ClientLayout
│   ├── providers/              # QueryProvider (TanStack Query)
│   └── ui/                     # Shadcn/ui primitives (Button, Card, Input, Modal...)
├── hooks/                      # Custom hooks data-fetching (TanStack Query)
├── lib/                        # Tiện ích: api-client.ts, axios.ts, utils.ts (cn())
├── schemas/                    # Zod validation schemas
└── stores/                     # Zustand stores (useAuthStore)
```

---

## 📂 Cấu trúc Backend (`backend/src/.../com/qlcafe/backend/`)

```
com.qlcafe.backend/
├── config/                     # Cấu hình ứng dụng
│   ├── SecurityConfig          # Spring Security + CORS
│   ├── CloudinaryConfig        # Kết nối Cloudinary
│   ├── DataInitializer         # Auto-hash mật khẩu BCrypt khi khởi động
│   └── WebMvcConfig            # Serve static files (uploads/)
├── controller/                 # REST Controllers
│   ├── AuthController          # POST /api/auth/login, /api/auth/google
│   ├── ProductController       # CRUD /api/products
│   ├── CategoryController      # CRUD /api/categories
│   ├── CafeTableController     # CRUD /api/tables
│   ├── OrderController         # CRUD /api/orders
│   ├── AccountController       # CRUD /api/accounts
│   ├── RevenueController       # GET /api/revenue (thống kê)
│   └── GlobalExceptionHandler  # Xử lý lỗi tập trung
├── dto/                        # Data Transfer Objects
├── entity/                     # JPA Entities (Account, Product, Order, ...)
├── repository/                 # Spring Data JPA Repositories
├── security/                   # JWT Filter, Token Provider, UserDetails
└── service/                    # Business Logic Services
```

---

## ✨ Các tính năng nổi bật

- **🔐 Bảo mật**: Authentication JWT + Google OAuth2 ID Token. Phân quyền `ADMIN` / `STAFF` tự động bảo vệ route.
- **🎨 Giao diện**: Thiết kế Glassmorphism + Gradient + Animations hiện đại. Responsive, hỗ trợ bàn phím.
- **📊 Dashboard**: Biểu đồ doanh thu Chart.js, thẻ thống kê tổng quan, modal chi tiết doanh thu.
- **📦 Quản lý Sản phẩm**: Bảng dữ liệu, upload ảnh lên **Cloudinary** (không mất khi restart), Soft Delete.
- **🪑 Sơ đồ Bàn & POS**: Chia màn hình 2 cột (menu + giỏ hàng). Hiệu ứng nhịp đập Pulse cho bàn có khách. Giao diện POS riêng cho Staff.
- **👤 Quản lý Tài khoản**: Admin tạo/sửa/xoá tài khoản nhân viên, phân quyền ADMIN/STAFF.
- **🤖 Trợ lý AI**: Tích hợp Google Gemini — AI đọc dữ liệu doanh thu, đơn hàng từ Database để phân tích và đưa lời khuyên kinh doanh.

---

## 🔑 Hướng dẫn chạy dự án (Local)

### Yêu cầu hệ thống

- **Java** 21+
- **Node.js** 20+
- **pnpm** (bắt buộc, không dùng npm/yarn)
- **SQL Server** (local hoặc remote)

### 1. Khởi tạo Database

1. Mở SQL Server Management Studio.
2. Chạy file `database/init.sql` để tạo bảng và dữ liệu mẫu.

### 2. Khởi động Backend (Spring Boot)

1. Mở terminal tại thư mục `backend/`.
2. Cấu hình kết nối DB trong `src/main/resources/application.properties`:
   - `spring.datasource.url` — Connection string SQL Server
   - `spring.datasource.username` / `password`
3. Chạy lệnh:
   ```bash
   ./mvnw spring-boot:run
   ```
   > **Lưu ý:** Lần đầu khởi động, `DataInitializer` tự động mã hoá BCrypt cho mật khẩu Admin.

### 3. Khởi động Frontend (Next.js)

1. Mở terminal tại thư mục `frontend/`.
2. Tạo/chỉnh file `.env.local`:
   ```env
   GEMINI_API_KEY=<your-gemini-api-key>
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```
3. Cài đặt dependencies:
   ```bash
   pnpm install
   ```
4. Chạy dev server:
   ```bash
   pnpm dev
   ```
5. Truy cập `http://localhost:3000/login` để đăng nhập.

> **Tài khoản mặc định:** `admin` / `admin123`

---

## 🐳 Docker (Backend)

Backend có sẵn `Dockerfile` multi-stage build (Maven build → JRE runtime):

```bash
cd backend
docker build -t qlcafe-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:sqlserver://host:1433;databaseName=QLCafe \
  -e SPRING_DATASOURCE_USERNAME=sa \
  -e SPRING_DATASOURCE_PASSWORD=yourpassword \
  -e CLOUDINARY_CLOUD_NAME=your-cloud-name \
  -e CLOUDINARY_API_KEY=your-api-key \
  -e CLOUDINARY_API_SECRET=your-api-secret \
  qlcafe-backend
```

---

## 🚀 Deploy Production

| Thành phần | Nền tảng | URL |
|---|---|---|
| Backend API | Render.com | `https://qlcafe-backend.onrender.com` |
| Database | Somee.com (SQL Server) | — |
| Frontend | Vercel / tùy chọn | — |

Sử dụng `database/init-db.sql` để khởi tạo schema trên Somee.com.

---

## 📜 Scripts hữu ích (Frontend)

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Chạy dev server (Turbopack) |
| `pnpm build` | Build production |
| `pnpm lint` | Kiểm tra code với Biome |
| `pnpm format` | Format code với Biome |
| `pnpm typecheck` | Kiểm tra TypeScript (`tsc --noEmit`) |
