import express from "express";
import cors from "cors";
import crypto from "crypto";
import { connectDB } from "./db.js";
import aiRoutes from "./aiRoutes.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use(aiRoutes);

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// --- 1. API ĐĂNG NHẬP 
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await connectDB();
        const hashedPassword = hashPassword(password);

        // 1. Chỉ cần tìm user theo Email và Password
        // Nhớ dùng đúng tên bảng 'Users' (có chữ s) và cột 'password_hash'
        const result = await pool.request()
            .input('email', email)
            .input('password', hashedPassword)
            .query(`
                SELECT user_id, username, email, role_id 
                FROM dbo.Users 
                WHERE email = @email AND password_hash = @password
            `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            
            // 2. Gửi thông tin user về cho React
            res.status(200).json({
                message: "Đăng nhập thành công!",
                user: {
                    user_id: user.user_id,
                    username: user.username, // Trong DB của bạn là username, không phải full_name
                    email: user.email,
                    role: user.role_id === 2 ? 'admin' : 'customer'
                }
            });
        } else {
            res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});

// --- 2. API ĐĂNG KÝ 
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ tên, email và mật khẩu." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
        }

        const pool = await connectDB();

        // 1. Kiểm tra email đã tồn tại chưa
        const checkEmail = await pool.request()
            .input('email', email)
            .query("SELECT email FROM dbo.Users WHERE email = @email");

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // 2. Chuẩn bị dữ liệu đăng ký
        const newUserId = 'U' + Date.now().toString().slice(-10);
        const defaultRoleId = 1;
        const hashedPassword = hashPassword(password);

        // 3. Thực hiện chèn dữ liệu với đầy đủ các cột NOT NULL
        await pool.request()
            .input('userId', newUserId)
            .input('username', username)
            .input('email', email)
            .input('passwordHash', hashedPassword)
            .input('roleId', defaultRoleId)
            .input('phone', '')    // Gửi chuỗi rỗng thay vì NULL
            .input('address', '')  // Gửi chuỗi rỗng thay vì NULL
            .query(`
                INSERT INTO dbo.Users (
                    user_id,
                    username,
                    email,
                    password_hash,
                    role_id,
                    phone_number,
                    default_address,
                    is_active
                )
                VALUES (
                    @userId,
                    @username,
                    @email,
                    @passwordHash,
                    @roleId,
                    @phone,
                    @address,
                    1
                )
            `);

        res.status(201).json({ message: "Tạo tài khoản E-Tech thành công!" });
    } catch (err) {
        console.error("Lỗi đăng ký chi tiết:", err);
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});
// --- 3. API LẤY TẤT CẢ SẢN PHẨM ---
// server.js
app.get("/products", async (req, res) => {
  try {
    const pool = await connectDB();

    // Sửa lại tên các cột cho khớp chính xác với sơ đồ image_d88b48.png
    const result = await pool.request().query(`
      SELECT TOP 170 
        product_id,
        product_name,
        cat_id,
        specs_json, 
        unit_price,
        stock_quantity,
        brand,
        warranty_period, 
        thumbnail_url AS image_url -- Đổi tên thumbnail_url thành image_url để khớp với Frontend
      FROM dbo.Products 
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi truy vấn sản phẩm:", err.message);
    res.status(500).send("Error fetching products: " + err.message);
  }
});

// --- 4. CHI TIẾT SẢN PHẨM ---
app.get("/products/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const { id } = req.params;
    const result = await pool.request()
      .input('id', id)
      .query("SELECT *, thumbnail_url as image_url FROM dbo.Products WHERE product_id = @id");

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send("Không thấy sản phẩm");
    }
  } catch (err) {
    res.status(500).send("Lỗi lấy chi tiết");
  }
});

// API lấy sản phẩm theo danh mục
app.get("/category/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const { id } = req.params;
    const result = await pool.request()
      .input('catId', id)
      .query(`
        SELECT 
          product_id, 
          product_name, 
          cat_id, 
          unit_price, 
          brand, 
          thumbnail_url AS image_url 
        FROM dbo.Products -- Phải có chữ 's'
        WHERE cat_id = @catId
      `);
    
    res.json(result.recordset); 
  } catch (err) {
    console.error("Lỗi SQL tại /category:", err.message);
    res.status(500).send("Lỗi hệ thống");
  }
});

// --- 5. PROFILE (Sửa: phone_number, default_address theo sơ đồ) ---
app.get("/profile/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const { id } = req.params;

    const result = await pool.request()
      .input('userId', id)
      .query(`
        SELECT 
          user_id, 
          username, 
          email, 
          phone_number, 
          default_address,
          role_id
        FROM dbo.Users 
        WHERE user_id = @userId
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send("Không tìm thấy người dùng");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi lấy thông tin cá nhân");
  }
});

// API cập nhật thông tin cá nhân
app.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { phone_number, default_address } = req.body;
    const pool = await connectDB();
    
    await pool.request()
      .input('userId', id)
      .input('phone', phone_number)
      .input('address', default_address)
      .query(`
        UPDATE dbo.Users 
        SET phone_number = @phone, default_address = @address 
        WHERE user_id = @userId
      `);
    
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi cập nhật thông tin");
  }
});

// --- 6. TÌM KIẾM ---
app.get("/search", async (req, res) => {
  try {
    const pool = await connectDB();
    const keyword = req.query.q; 
    const result = await pool.request()
      .input('keyword', `%${keyword}%`) 
      .query("SELECT product_id, product_name, unit_price, thumbnail_url as image_url FROM dbo.Products WHERE product_name LIKE @keyword OR brand LIKE @keyword");
    res.json(result.recordset); 
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- 7. GIỎ HÀNG 
app.post("/cart/add", async (req, res) => {
  try {
    const pool = await connectDB();
    const { userId, productId, quantity } = req.body;

    const checkItem = await pool.request()
      .input('userId', userId)
      .input('productId', productId)
      .query("SELECT * FROM dbo.Carts WHERE user_id = @userId AND product_id = @productId");
    if (checkItem.recordset.length > 0) {
      await pool.request()
        .input('userId', userId)
        .input('productId', productId)
        .input('qty', quantity)
        .query("UPDATE dbo.Carts SET quantity = quantity + @qty WHERE user_id = @userId AND product_id = @productId");
    } else {
      await pool.request()
        .input('userId', userId)
        .input('productId', productId)
        .input('qty', quantity)
        .query("INSERT INTO dbo.Carts (user_id, product_id, quantity) VALUES (@userId, @productId, @qty)");
    }
    res.status(200).send("Đã thêm thành công!");
  } catch (err) {
    console.error("Lỗi Cart:", err);
    res.status(500).send("Lỗi khi thêm vào giỏ hàng");
  }
});

// API lấy giỏ hàng của người dùng
app.get("/cart/:userId", async (req, res) => {
  try {
    const pool = await connectDB();
    const { userId } = req.params;
    const result = await pool.request()
      .input('userId', userId)
      .query(`
        SELECT c.cart_id, c.quantity, p.product_name, p.unit_price, p.thumbnail_url as image_url, p.product_id
        FROM dbo.Carts c
        JOIN dbo.Products p ON c.product_id = p.product_id
        WHERE c.user_id = @userId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Lỗi lấy giỏ hàng");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`>>> E-TECH SERVER IS RUNNING AT: http://localhost:${PORT}`);
});