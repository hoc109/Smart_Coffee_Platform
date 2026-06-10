-- ==========================================
-- QLCafe Database — Production Init Script
-- Target: SQL Server (Somee.com)
-- HƯỚNG DẪN: Chạy script này trong SQL Server Management Studio
--             hoặc dùng công cụ online của Somee
-- ==========================================

-- ==========================================
-- 1. SỬ DỤNG DATABASE (Somee đã tạo sẵn DB)
--    Đổi tên 'QLCafe' thành tên DB bạn tạo trên Somee
-- ==========================================
USE QLCafe1;
GO

-- ==========================================
-- 2. XÓA BẢNG CŨ NẾU TỒN TẠI (theo thứ tự phụ thuộc FK)
-- ==========================================
IF OBJECT_ID('dbo.OrderDetail', 'U') IS NOT NULL DROP TABLE dbo.OrderDetail;
IF OBJECT_ID('dbo.Orders',      'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Product',     'U') IS NOT NULL DROP TABLE dbo.Product;
IF OBJECT_ID('dbo.CafeTable',   'U') IS NOT NULL DROP TABLE dbo.CafeTable;
IF OBJECT_ID('dbo.Category',    'U') IS NOT NULL DROP TABLE dbo.Category;
IF OBJECT_ID('dbo.Account',     'U') IS NOT NULL DROP TABLE dbo.Account;
GO

-- ==========================================
-- 3. TẠO CÁC BẢNG
-- ==========================================

-- Bảng Tài khoản (Đăng nhập, phân quyền)
CREATE TABLE Account (
    id       INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50)  UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(20)  NOT NULL  -- ADMIN, STAFF
);

-- Bảng Danh mục sản phẩm
CREATE TABLE Category (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);

-- Bảng Sản phẩm (Menu đồ uống)
CREATE TABLE Product (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(100) NOT NULL,
    price        DECIMAL(18,2) NOT NULL,
    image_url    VARCHAR(500),            -- Lưu full URL Cloudinary
    category_id  INT,
    is_available BIT DEFAULT 1,           -- 1: Còn hàng, 0: Hết hàng (Soft Delete)
    FOREIGN KEY (category_id) REFERENCES Category(id)
);

-- Bảng Sơ đồ bàn
CREATE TABLE CafeTable (
    id     INT IDENTITY(1,1) PRIMARY KEY,
    name   NVARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE'  -- AVAILABLE | OCCUPIED
);

-- Bảng Hóa đơn
CREATE TABLE Orders (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    table_id     INT,
    account_id   INT,
    total_amount DECIMAL(18,2) DEFAULT 0,
    status       VARCHAR(20)   DEFAULT 'PENDING',  -- PENDING | PAID | CANCELLED
    created_at   DATETIME      DEFAULT GETDATE(),
    FOREIGN KEY (table_id)   REFERENCES CafeTable(id),
    FOREIGN KEY (account_id) REFERENCES Account(id)
);

-- Bảng Chi tiết hóa đơn
CREATE TABLE OrderDetail (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    order_id   INT,
    product_id INT,
    quantity   INT           NOT NULL CHECK (quantity > 0),
    price      DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES Orders(id),
    FOREIGN KEY (product_id) REFERENCES Product(id)
);
GO

-- ==========================================
-- 4. DỮ LIỆU MẪU
-- ==========================================

-- Tài khoản Admin mặc định
-- Username: admin
-- Password: admin123  (đã được mã hóa BCrypt bởi Spring Boot khi đăng nhập lần đầu)
-- LƯU Ý: Đây là BCrypt hash của "admin123" — hãy đổi ngay sau khi deploy!
INSERT INTO Account (username, password, role)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');

-- Danh mục
INSERT INTO Category (name, description) VALUES
(N'Cà phê pha máy', N'Các loại cà phê Espresso, Latte, Cappuccino'),
(N'Trà trái cây',   N'Trà thanh nhiệt, tươi mát'),
(N'Bánh ngọt',      N'Bánh dùng kèm trà và cà phê');

-- Bàn
INSERT INTO CafeTable (name, status) VALUES
(N'Bàn 1',   'AVAILABLE'),
(N'Bàn 2',   'AVAILABLE'),
(N'Bàn 3',   'AVAILABLE'),
(N'Bàn 4',   'AVAILABLE'),
(N'Bàn VIP', 'AVAILABLE');

-- Sản phẩm (image_url để null — sẽ upload ảnh lại qua giao diện Admin sau khi deploy)
INSERT INTO Product (name, price, image_url, category_id, is_available) VALUES
(N'Cà phê Đen Đá',   25000, NULL, 1, 1),
(N'Bạc Xỉu',         30000, NULL, 1, 1),
(N'Trà Đào Cam Sả',  45000, NULL, 2, 1),
(N'Trà Vải Nhiệt Đới',45000, NULL, 2, 1),
(N'Bánh Croissant',  35000, NULL, 3, 1),
(N'Tiramisu',        40000, NULL, 3, 1);
GO

-- ==========================================
-- 5. VIEW: Thống kê doanh thu theo ngày
-- ==========================================
IF OBJECT_ID('dbo.vw_DailyRevenue', 'V') IS NOT NULL DROP VIEW dbo.vw_DailyRevenue;
GO

CREATE VIEW vw_DailyRevenue AS
SELECT
    CAST(created_at AS DATE) AS OrderDate,
    COUNT(id)                AS TotalOrders,
    SUM(total_amount)        AS DailyRevenue
FROM Orders
WHERE status = 'PAID'
GROUP BY CAST(created_at AS DATE);
GO

-- ==========================================
-- 6. STORED PROCEDURE: Chốt ca / Thanh toán hóa đơn
-- ==========================================
IF OBJECT_ID('dbo.sp_CheckoutOrder', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CheckoutOrder;
GO

CREATE PROCEDURE sp_CheckoutOrder
    @OrderId INT
AS
BEGIN
    DECLARE @Total DECIMAL(18,2);
    SELECT @Total = ISNULL(SUM(quantity * price), 0)
    FROM OrderDetail
    WHERE order_id = @OrderId;

    UPDATE Orders
    SET total_amount = @Total,
        status       = 'PAID'
    WHERE id = @OrderId;
END;
GO

-- ==========================================
-- XONG! Kiểm tra dữ liệu:
-- SELECT * FROM Account;
-- SELECT * FROM Category;
-- SELECT * FROM CafeTable;
-- SELECT * FROM Product;
-- ==========================================
