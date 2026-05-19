---

# 🛒 E-Tech v2026 - Advanced E-Commerce Web Application

Chào mừng sếp và các bạn sinh viên đến với dự án **E-Tech v2026**! Đây là hệ thống website thương mại điện tử chuyên kinh doanh thiết bị công nghệ thông minh.

---

## 📐 Kiến trúc & Thiết kế (Architecture & Approach)

### 1. Hướng thiết kế

Dự án áp dụng mô hình phân tách **Boundary - Control - Entity (BCE)** phối hợp với kiến trúc **3 lớp (3-Tier)** chuẩn công nghiệp:

* **Presentation Tier:** React.js với Component-based architecture.
* **Business Logic Tier:** Middleware & API Routes xử lý nghiệp vụ tập trung.
* **Data Tier:** DAO Layer làm việc trực tiếp với MS SQL Server.

### 2. Cấu trúc Thư mục chính

```text
E-Tech-v2026/
├── Backend/             # Máy chủ tổng điều phối nghiệp vụ (Node.js)
│   ├── .env             # [CẦN TẠO] Cấu hình DB & JWT
│   └── ...
├── customer/            # Giao diện React dành cho Khách hàng
└── admin/               # Giao diện React dành cho Quản trị viêndocs/               

```

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Bước 1: Điều kiện tiên quyết

1. **Node.js**: Phiên bản **v18.0.0+**.
2. **SQL Server**: Phiên bản 2022+ và **SSMS**.

### Bước 2: Cấu hình Backend (Quan trọng)

Sếp truy cập vào thư mục `Backend/`, tạo file **`.env`** và điền cấu hình:

```env
JWT_SECRET=ETechSecretKey2026_SecureWithLove
JWT_EXPIRES_IN=7d
PORT=5000
DB_USER=sa
DB_PASSWORD=Mật_Khẩu
DB_SERVER=localhost
DB_DATABASE=ETechDB

```

### Bước 3: Khởi chạy hệ thống

Để hệ thống vận hành trơn tru, mở 3 cửa sổ Terminal độc lập:

#### 🛒 1. Khách hàng (Customer)

```bash
cd customer
npm install
npm start

```

*(Truy cập: http://localhost:3000)*

#### 💼 2. Quản trị viên (Admin)

```bash
cd admin
npm install
npm start

```

*(Truy cập: http://localhost:3001 - hoặc cổng tự động)*

#### 🚀 3. Backend (API Server)

```bash
cd Backend
npm install 
npm start

```

*(Backend luôn sẵn sàng tại: http://localhost:5000)*
mặc định là của khách hàng 
nếu muốn mở của admin thì đổi lệnh cuối thành node adminServer.js

---

## 💡 Lưu ý sửa lỗi nhanh (Troubleshooting)

* **Lỗi 404/401:** Kiểm tra kỹ file `.env` tại thư mục `Backend/`. Đảm bảo `DB_PASSWORD` đã khớp với mật khẩu SQL Server của sếp.
* **Lỗi `EPERM`:** Hệ thống đã tích hợp file `.npmrc` để ép npm tạo cache cục bộ, giúp bẻ gãy mọi xung đột quyền truy cập hệ thống.
* **Thay đổi Config:** Mỗi khi sửa file `.env` hoặc cập nhật Route, sếp bắt buộc phải tắt server (**`Ctrl + C`**) và chạy lại **`npm start`** để làm sạch cache.

---
