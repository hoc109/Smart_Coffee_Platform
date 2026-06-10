# Website Quản Lý Quán Cà Phê

-Dự án Hệ thống Website Quản lý quán cà phê đã được triển khai hoàn tất toàn bộ từ Database, Backend, Frontend cho đến Tích hợp Trí tuệ Nhân tạo. 
-Hệ thống bao gồm các tính năng quản lý sản phẩm, sơ đồ bàn, đặt hàng (POS), thanh toán và tích hợp trợ lý ảo AI để phân tích kinh doanh.

## Công nghệ sử dụng:
- **Frontend**: Next.js (App Router), Tailwind CSS, Axios, Lucide React, Chart.js.
- **Backend**: Java Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, REST API.
- **Database**: SQL Server.
- **AI**: Google Gemini API (`@google/generative-ai` với model `gemini-2.5-flash`).

## 📁 Cấu trúc thư mục:
- `backend/`: Chứa mã nguồn Spring Boot. Đã được cấu hình tự động tạo bảng (JPA) và Auto-hash mật khẩu bằng BCrypt.
- `frontend/`: Chứa mã nguồn Next.js.
- `database/init.sql`: File SQL script gốc dùng để khởi tạo Database.

## 📂 Cấu trúc thư mục chính:
- `src/app/`: Chứa định tuyến các trang (Pages) của hệ thống.
  - `/login`: Giao diện đăng nhập bảo mật.
  - `/dashboard`: Bảng điều khiển thống kê tổng quan.
  - `/products`: Màn hình quản lý sản phẩm.
  - `/tables`: Quản lý sơ đồ bàn.
  - `/orders`: Màn hình POS gọi đồ uống và thanh toán.
  - `/orders-history`: Trang quản lý lịch sử đơn hàng.
  - `/ai-assistant`: Trợ lý ảo AI phân tích kinh doanh.
  - `/api/chat/route.ts`: API Route trung gian gọi tới Google Gemini.
- `src/components/layout/`: Chứa cấu trúc Giao diện dùng chung (`Sidebar`, `Navbar`, `ClientLayout`).
- `src/lib/`: Chứa các tiện ích, đặc biệt là cấu hình `axios.ts` xử lý việc gắn Token vào Headers một cách tự động.

## ✨ Các tính năng nổi bật:
- **Bảo mật**: Authentication và Phân quyền (ADMIN, STAFF) bằng JWT (Json Web Token) an toàn.
- **Giao diện (UI/UX)**: Thiết kế chuẩn Aesthetic, tối đa hóa trải nghiệm người dùng với Glassmorphism, Gradient và các hiệu ứng Animations hiện đại. Tự động bảo vệ route dựa trên token.
- **Dashboard Thống kê**: Tích hợp Chart.js hiển thị biểu đồ doanh thu trực quan, thẻ thông tin tổng quan sinh động.
- **Quản lý Sản phẩm**: Liệt kê dạng bảng hiện đại, hỗ trợ popup Upload ảnh động, thao tác thêm/sửa/xoá (Soft delete).
- **Quản lý Bàn & Đặt đồ (POS)**: Hệ thống tối ưu hóa luồng gọi món (chia màn hình 2 cột: menu và giỏ hàng). Sơ đồ bàn hiển thị màu sắc thông minh (Hiệu ứng nhịp đập Pulse đối với bàn đang có khách).
- **Trợ lý ảo AI**: Tích hợp sức mạnh của LLM (Gemini 3.1 Pro). Trợ lý AI có khả năng "đọc" dữ liệu Database (doanh thu, đơn hàng, mặt hàng) để chủ động phân tích và đưa ra lời khuyên kinh doanh sâu sắc dựa trên số liệu thực tế.

## 🔑 Hướng dẫn chạy dự án

### 1. Khởi động Backend (Spring Boot)
1. Mở terminal tại thư mục `backend`.
2. Đảm bảo cấu hình database trong `src/main/resources/application.properties` trùng khớp với SQL Server của bạn.
3. Chạy lệnh để biên dịch và khởi động:
   ```bash
   ./mvnw spring-boot:run
   ```
   > **Lưu ý:** Lần đầu khởi động, hệ thống sẽ tự động quét và tự động mã hoá chuẩn BCrypt cho mật khẩu Admin (`Admin109205@`) thay cho chuỗi thuần trong file SQL.

### 2. Khởi động Frontend (Next.js)
1. Mở terminal tại thư mục `frontend`.
2. Mở file `.env.local` và thay thế giá trị `YOUR_GEMINI_API_KEY_HERE` bằng API Key thật của bạn lấy từ Google AI Studio.
3. Cài đặt các thư viện (nếu bạn tải source code mới):
   ```bash
   npm install
   ```
4. Chạy lệnh khởi động máy chủ Frontend:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập `http://localhost:3000/login` để đăng nhập.
