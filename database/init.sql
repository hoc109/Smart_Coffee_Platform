-- ==========================================
-- 1. TẠO DATABASE
-- ==========================================
CREATE DATABASE QLCafe;
GO

USE QLCafe;
GO

-- ==========================================
-- 2. TẠO CÁC BẢNG (TABLES)
-- ==========================================

-- Bảng Tài khoản (Đăng nhập, phân quyền)
CREATE TABLE Account (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- Ví dụ: ADMIN, STAFF
);

-- Bảng Danh mục sản phẩm (Cà phê, Trà, Nước ép...)
CREATE TABLE Category (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);

-- Bảng Sản phẩm (Menu đồ uống)
CREATE TABLE Product (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    image_url VARCHAR(255),
    category_id INT,
    is_available BIT DEFAULT 1, -- 1: Còn hàng, 0: Hết hàng
    FOREIGN KEY (category_id) REFERENCES Category(id)
);

-- Bảng Sơ đồ bàn (Bàn 1, Bàn 2...)
CREATE TABLE CafeTable (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' -- AVAILABLE (Trống), OCCUPIED (Có khách)
);

-- Bảng Hóa đơn (Lưu trữ thông tin tổng quát của một lần gọi món)
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    table_id INT,
    account_id INT,
    total_amount DECIMAL(18,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING (Đang phục vụ), PAID (Đã thanh toán), CANCELLED (Hủy)
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (table_id) REFERENCES CafeTable(id),
    FOREIGN KEY (account_id) REFERENCES Account(id)
);

-- Bảng Chi tiết hóa đơn (Lưu trữ từng món trong hóa đơn)
CREATE TABLE OrderDetail (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(18,2) NOT NULL, -- Lưu lại giá tại thời điểm mua (tránh trường hợp sau này sản phẩm tăng giá làm sai doanh thu cũ)
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (product_id) REFERENCES Product(id)
);
GO

-- ==========================================
-- 3. THÊM DỮ LIỆU MẪU (DUMMY DATA)
-- ==========================================

-- Insert default admin account (Password is 'admin' hashed with BCrypt)
INSERT INTO Account (username, password, role) VALUES ('admin', 'Admin109205@', 'ADMIN');

-- Thêm Danh mục
INSERT INTO Category (name, description) VALUES 
(N'Cà phê pha máy', N'Các loại cà phê Espresso, Latte, Cappuccino'),
(N'Trà trái cây', N'Trà thanh nhiệt, tươi mát'),
(N'Bánh ngọt', N'Bánh dùng kèm trà và cà phê');

-- Thêm Bàn
INSERT INTO CafeTable (name, status) VALUES 
(N'Bàn 1', 'AVAILABLE'),
(N'Bàn 2', 'AVAILABLE'),
(N'Bàn 3', 'AVAILABLE'),
(N'Bàn 4', 'AVAILABLE'),
(N'Bàn VIP', 'AVAILABLE');

-- Thêm Sản phẩm
INSERT INTO Product (name, price, image_url, category_id, is_available) VALUES
(N'Cà phê Đen Đá', 25000, 'cafe-den.jpg', 1, 1),
(N'Bạc Xỉu', 30000, 'bac-xiu.jpg', 1, 1),
(N'Trà Đào Cam Sả', 45000, 'tra-dao.png', 2, 1),
(N'Trà Vải Nhiệt Đới', 45000, 'tra-vai.jpg', 2, 1),
(N'Bánh Croissant', 35000, 'croissant.jpg', 3, 1),
(N'Tiramisu', 40000, 'tiramisu.jpg', 3, 1);
GO

-- View: Thống kê tổng doanh thu và số đơn hàng theo từng ngày
CREATE VIEW vw_DailyRevenue AS
SELECT 
    CAST(created_at AS DATE) AS OrderDate,
    COUNT(id) AS TotalOrders,
    SUM(total_amount) AS DailyRevenue
FROM 
    Orders
WHERE 
    status = 'PAID' -- Chỉ tính các đơn đã thanh toán
GROUP BY 
    CAST(created_at AS DATE);
GO

-- SP: Chốt ca / Thanh toán một hóa đơn
CREATE PROCEDURE sp_CheckoutOrder
    @OrderId INT
AS
BEGIN
    -- Tính tổng tiền từ chi tiết hóa đơn
    DECLARE @Total DECIMAL(18,2);
    SELECT @Total = ISNULL(SUM(quantity * price), 0)
    FROM OrderDetail
    WHERE order_id = @OrderId;

    -- Cập nhật vào hóa đơn chính và đổi trạng thái
    UPDATE Orders
    SET 
        total_amount = @Total,
        status = 'PAID'
    WHERE 
        id = @OrderId;
END;
GO
