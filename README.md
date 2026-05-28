# E-Tech

## Giới thiệu

E-Tech là dự án web thương mại điện tử cho thiết bị công nghệ thông minh, được phát triển cho báo cáo thành quả cuối kỳ.
Mục tiêu chính là xây dựng một hệ thống hoàn chỉnh với phần khách hàng, phần quản trị và trọng tâm là tính năng AI gợi ý sản phẩm thông minh.

## Mục tiêu báo cáo cuối kỳ

- Trình bày rõ chức năng đã xây dựng.
- Nêu đúng vai trò và đóng góp của AI trong dự án.
- Giải thích kiến trúc, luồng dữ liệu và cách triển khai công nghệ.
- Nhấn mạnh điểm khác biệt: gợi ý sản phẩm dựa trên hành vi người dùng và giỏ hàng.

## Cấu trúc dự án

```text
TTCS/
├── Backend/           # API server Node.js + logic nghiệp vụ + DB
├── customer/          # Frontend React dành cho người mua
└── admin/             # Frontend React dành cho quản trị
```

## Tính năng chính

### 1. Phần khách hàng
- Trang chủ hiển thị sản phẩm và gợi ý sản phẩm cá nhân hóa.
- Tìm kiếm theo từ khóa.
- Duyệt sản phẩm theo danh mục.
- Xem chi tiết sản phẩm, thêm vào giỏ hàng.
- Quản lý giỏ hàng: tăng giảm số lượng, xóa sản phẩm, thanh toán.
- Thanh toán tự động điền thông tin profile người dùng.
- Quản lý hồ sơ cá nhân và lịch sử đơn hàng.
- Chatbot tương tác và hệ thống thông báo.

### 2. Phần quản trị
- Quản lý sản phẩm, danh mục, đơn hàng và người dùng.
- Thay đổi quyền hạn và trạng thái tài khoản.
- Xem thống kê dữ liệu dashboard.

## Trọng tâm AI trong dự án

AI là phần lõi cần nêu trong báo cáo cuối kỳ. Dự án triển khai các luồng gợi ý sau:

### 1. `similar-products`
- Gợi ý sản phẩm tương tự dựa trên sản phẩm khách hàng đang xem.
- API backend: `GET /api/ai/similar-products/:productId`.
- Frontend dùng để hiển thị phần gợi ý cá nhân hóa.

### 2. `personalized`
- Gợi ý sản phẩm cá nhân hóa cho người dùng đã đăng nhập.
- API backend: `GET /api/ai/personalized/:userId`.
- Dựa vào dữ liệu người dùng và lịch sử giỏ hàng để chọn sản phẩm phù hợp.

### 3. `personalized-from-cart`
- Gợi ý nâng cao dựa trên danh sách sản phẩm trong giỏ hàng.
- API backend: `POST /api/ai/personalized-from-cart`.
- Đây là phần AI có ý nghĩa nhất cho báo cáo, vì nó thể hiện khả năng dự đoán nhu cầu bổ sung.

### 4. API `refresh-cart`
- `POST /api/ai/refresh-cart` kích hoạt quy trình retrain AI.
- Giúp hệ thống cập nhật mô hình dựa trên hành vi giỏ hàng mới.

## Backend API chính

### Người dùng
- `POST /api/user/login` - đăng nhập.
- `POST /api/user/register` - đăng ký.
- `GET /api/user/profile/:id` - lấy thông tin profile.
- `PUT /api/user/profile/:id` - cập nhật profile.

### Giỏ hàng
- `POST /api/cart/add` - thêm hoặc cập nhật số lượng sản phẩm.
- `GET /api/cart/:userId` - lấy giỏ hàng người dùng.
- `DELETE /api/cart/remove/:productId` - xóa sản phẩm khỏi giỏ hàng.

### Đơn hàng
- `POST /api/orders/checkout` - tạo đơn và thanh toán.
- `GET /api/orders/history` - lấy lịch sử đơn hàng.

### Sản phẩm
- `GET /api/products` - lấy toàn bộ sản phẩm.
- `GET /api/products/category/:catId` - lấy sản phẩm theo danh mục.
- `GET /api/products/search?q=...` - tìm kiếm sản phẩm.
- `GET /api/products/:id` - lấy chi tiết sản phẩm.

### AI
- `GET /api/ai/similar-products/:productId`
- `GET /api/ai/personalized/:userId`
- `POST /api/ai/personalized-from-cart`
- `POST /api/ai/refresh-cart`

### Khác
- `POST /chat` - chatbot tương tác.

## Kiến trúc hệ thống

### Backend
- `Backend/server.js`: cài đặt Express, route và middleware.
- `Backend/routes/`: định nghĩa các đường dẫn API.
- `Backend/modules/`: xử lý nghiệp vụ, gồm logic AI, cart, order, user.
- `Backend/daos/`: truy xuất dữ liệu SQL Server.
- `Backend/config/db.js`: kết nối cơ sở dữ liệu.
- `Backend/middleware/`: xác thực JWT và kiểm tra admin.

### Frontend customer
- `customer/src/pages/`: cấu trúc các trang chính.
- `customer/src/services/`: quản lý gọi API.
- `customer/src/components/`: các thành phần dùng chung.

### Frontend admin
- Cấu trúc tương tự `customer/`, tập trung vào quản lý.

## Hướng dẫn cài đặt

### Backend
```bash
cd Backend
npm install
npm start
```

### Customer
```bash
cd customer
npm install
npm start
```

### Admin
```bash
cd admin
npm install
npm start
```

## Cấu hình môi trường

Tạo file `Backend/.env` với:
```env
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
DB_USER=sa
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_DATABASE=your_database_name
AI_SERVICE_URL=http://localhost:xxxx
AI_SECRET=your_ai_service_secret
```

## Gợi ý cho phần báo cáo

### 1. Nội dung cần nêu rõ
- Mục tiêu dự án và phạm vi tính năng.
- Kiến trúc 3 tầng: Frontend, Backend, Database.
- Các API chính và luồng dữ liệu.
- Vai trò AI trong gợi ý sản phẩm.
- Cách AI cải thiện trải nghiệm mua sắm.

### 2. Phần AI nên mô tả
- Luồng dữ liệu đầu vào: userId, productId, giỏ hàng.
- Xử lý gợi ý: tương tự, cá nhân hóa, giỏ hàng dự đoán.
- Cơ chế retrain/refresh khi giỏ hàng thay đổi.
- Lợi ích: tăng cơ hội mua thêm, giảm thời gian tìm kiếm, cá nhân hóa trải nghiệm.

### 3. Kết luận báo cáo
- Dự án không chỉ là web bán hàng, mà còn là hệ thống AI hỗ trợ bán hàng.
- AI là điểm nhấn quan trọng để phân biệt với website thương mại điện tử thông thường.
- Tính năng AI thể hiện được năng lực ứng dụng công nghệ trong bài tập cuối kỳ.

## Lưu ý

- Đảm bảo viết báo cáo theo hướng “công nghệ + nghiệp vụ”.
- Nhấn mạnh phần AI, nhưng vẫn giữ logic kết nối với giỏ hàng và trải nghiệm người dùng.
- Có thể bổ sung sơ đồ quy trình `User → Frontend → Backend → AI` để bài báo cáo rõ ràng hơn.
