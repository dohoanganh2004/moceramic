-- =====================================================================
-- SCHEMA CƠ SỞ DỮ LIỆU: WEBSITE BÁN HÀNG ĐỒ GỐM 
-- =====================================================================
CREATE DATABASE IF NOT EXISTS moceramic_shop_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE moceramic_shop_db;
SET NAMES utf8mb4;


CREATE TABLE roles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,   -- vd: customer, admin, sales_staff, warehouse_staff, accountant, marketing
    description     VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE permissions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(100) NOT NULL UNIQUE,  -- vd: product.create, product.edit, order.view, order.update_status, report.view
    description     VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE role_permissions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id         INT NOT NULL,
    permission_id   INT NOT NULL,
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 2. NGƯỜI DÙNG (chung cho khách hàng lẫn nhân viên/quản trị)
-- ============================

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255),               -- NULL nếu đăng nhập qua Google/Facebook (chỉ áp dụng khách hàng)
    oauth_provider  VARCHAR(30),                 -- 'google', 'facebook', NULL nếu đăng ký bằng mật khẩu
    avatar_url      VARCHAR(500),
    role_id         INT NOT NULL,                -- mọi user đều có đúng 1 role (vd: role 'customer' cho khách mua hàng thường)
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_users_role ON users(role_id);

CREATE TABLE addresses (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    recipient_name  VARCHAR(150) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    address_line    VARCHAR(255) NOT NULL,
    ward            VARCHAR(100),
    district        VARCHAR(100),
    city            VARCHAR(100) NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT 'Việt Nam',
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Lưu JWT đã bị vô hiệu hóa (logout / đổi mật khẩu / bị thu hồi) trước khi
-- token tự hết hạn theo "exp". Giờ chỉ cần trỏ về users (đã gộp admin_users).
CREATE TABLE blacklisted_tokens (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_jti       VARCHAR(100) NOT NULL UNIQUE,  -- claim "jti" (JWT ID) - KHÔNG lưu nguyên chuỗi token
    user_id         BIGINT NOT NULL,
    token_type      VARCHAR(20) NOT NULL DEFAULT 'access',   -- access | refresh
    reason          VARCHAR(30) NOT NULL DEFAULT 'logout',   -- logout | password_changed | force_logout | security_breach
    expires_at      DATETIME NOT NULL,   -- = "exp" gốc của token, dùng để job dọn dẹp xóa bản ghi đã hết hạn
    blacklisted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blacklist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_blacklist_jti ON blacklisted_tokens(token_jti);
CREATE INDEX idx_blacklist_expires ON blacklisted_tokens(expires_at);
CREATE INDEX idx_blacklist_user ON blacklisted_tokens(user_id);

-- ============================
-- 3. DANH MỤC & SẢN PHẨM
-- ============================

CREATE TABLE categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id       BIGINT,                          -- tự tham chiếu -> danh mục đa cấp, NULL nếu là danh mục gốc
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(180) NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE products (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id         BIGINT NOT NULL,
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(220) NOT NULL UNIQUE,
    description         TEXT,
    care_instructions   TEXT,                       -- hướng dẫn bảo quản (đồ gốm dễ vỡ)
    material            VARCHAR(150),                -- chất liệu đất/men
    origin              VARCHAR(150),                -- xuất xứ / làng nghề
    base_price          DECIMAL(12,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'active', -- active | inactive | draft
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

CREATE TABLE product_variants (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT NOT NULL,
    sku             VARCHAR(80) NOT NULL UNIQUE,
    color_glaze     VARCHAR(100),      -- màu men
    size            VARCHAR(50),
    price           DECIMAL(12,2) NOT NULL,
    weight_grams    INT,
    dimensions      VARCHAR(100),      -- vd: "20x20x30 cm"
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_variants_product ON product_variants(product_id);

CREATE TABLE product_images (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT,
    variant_id      BIGINT,
    image_url       VARCHAR(500) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_images_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    CONSTRAINT chk_images_target CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_images_product ON product_images(product_id);
CREATE INDEX idx_images_variant ON product_images(variant_id);

CREATE TABLE inventory (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    variant_id          BIGINT NOT NULL UNIQUE,
    quantity_on_hand    INT NOT NULL DEFAULT 0,
    quantity_reserved   INT NOT NULL DEFAULT 0,   -- giữ hàng khi khách đang thanh toán
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 4. GIỎ HÀNG & ĐƠN HÀNG
-- ============================

CREATE TABLE carts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT,                                          -- NULL nếu khách chưa đăng nhập vẫn được thêm giỏ hàng
    session_id      VARCHAR(100),                                    -- dùng cho giỏ hàng khách chưa đăng nhập
    status          VARCHAR(20) NOT NULL DEFAULT 'active',           -- active | converted | abandoned
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

CREATE TABLE cart_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id         BIGINT NOT NULL,
    variant_id      BIGINT NOT NULL,
    quantity        INT NOT NULL,
    price_at_add    DECIMAL(12,2) NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT chk_cart_items_qty CHECK (quantity > 0),
    UNIQUE KEY uq_cart_variant (cart_id, variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vouchers (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    code                VARCHAR(50) NOT NULL UNIQUE,
    description         VARCHAR(255),
    discount_type       VARCHAR(20) NOT NULL,   -- percentage | fixed
    discount_value      DECIMAL(12,2) NOT NULL,
    min_order_amount    DECIMAL(12,2) DEFAULT 0,
    max_discount_amount DECIMAL(12,2),
    start_date          DATETIME,
    end_date            DATETIME,
    usage_limit         INT,
    used_count          INT NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code              VARCHAR(30) NOT NULL UNIQUE,
    user_id                 BIGINT NOT NULL,          -- bắt buộc đăng nhập mới đặt hàng được (không hỗ trợ guest checkout)
    shipping_address_id     BIGINT,
    shipping_snapshot       TEXT,                      -- lưu snapshot địa chỉ tại thời điểm đặt (phòng khi user sửa/xóa address sau)
    status                  VARCHAR(30) NOT NULL DEFAULT 'pending',  -- pending|confirmed|packing|shipping|completed|cancelled|returned
    subtotal                DECIMAL(12,2) NOT NULL,
    discount_amount         DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_fee            DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount            DECIMAL(12,2) NOT NULL,
    voucher_id              BIGINT,
    note                    TEXT,
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id),
    CONSTRAINT fk_orders_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id                BIGINT NOT NULL,
    variant_id              BIGINT NOT NULL,
    product_name_snapshot   VARCHAR(200) NOT NULL,   -- lưu snapshot tên sản phẩm tại thời điểm mua
    variant_snapshot        VARCHAR(150),            -- lưu snapshot màu men/kích cỡ
    unit_price              DECIMAL(12,2) NOT NULL,
    quantity                INT NOT NULL,
    subtotal                DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_status_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    status          VARCHAR(30) NOT NULL,
    note            VARCHAR(255),
    changed_by      BIGINT,                          -- trỏ về users (nhân viên/quản trị thực hiện thay đổi)
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_status_history_order ON order_status_history(order_id);

CREATE TABLE voucher_usages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_id      BIGINT NOT NULL,
    order_id        BIGINT NOT NULL,
    user_id         BIGINT,
    used_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voucher_usages_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
    CONSTRAINT fk_voucher_usages_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_voucher_usages_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 5. THANH TOÁN & VẬN CHUYỂN
-- ============================

CREATE TABLE payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    method          VARCHAR(30) NOT NULL,   -- cod | bank_transfer | momo | zalopay | vnpay | card
    amount          DECIMAL(12,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | success | failed | refunded
    transaction_ref VARCHAR(150),           -- mã giao dịch từ cổng thanh toán
    paid_at         DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_payments_order ON payments(order_id);

CREATE TABLE shipments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT NOT NULL,
    carrier             VARCHAR(50),          -- GHN, GHTK, ...
    tracking_code       VARCHAR(100),
    status              VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending|picked_up|in_transit|delivered|failed
    shipping_fee        DECIMAL(12,2) NOT NULL DEFAULT 0,
    estimated_delivery  DATE,
    delivered_at        DATETIME,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_shipments_order ON shipments(order_id);

-- ============================
-- 6. ĐẶT HÀNG THEO YÊU CẦU (CUSTOM ORDER)
-- ============================

CREATE TABLE custom_orders (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT,
    contact_name            VARCHAR(150) NOT NULL,
    contact_email           VARCHAR(150) NOT NULL,
    contact_phone           VARCHAR(20) NOT NULL,
    description             TEXT NOT NULL,           -- mô tả yêu cầu (kích thước, in/khắc logo...)
    quantity                INT NOT NULL,
    desired_completion_date DATE,
    status                  VARCHAR(30) NOT NULL DEFAULT 'requested', -- requested|quoted|confirmed|in_production|completed|cancelled
    quoted_price            DECIMAL(12,2),
    admin_note              TEXT,
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_custom_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE custom_order_attachments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id BIGINT NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_custom_attachments_order FOREIGN KEY (custom_order_id) REFERENCES custom_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 7. ĐÁNH GIÁ & YÊU THÍCH
-- ============================

CREATE TABLE reviews (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    order_item_id   BIGINT,                          -- dùng để xác thực "đã mua hàng"
    rating          TINYINT NOT NULL,
    comment         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|approved|rejected
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_reviews_product ON reviews(product_id);

CREATE TABLE review_images (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id       BIGINT NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wishlists (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_wishlist_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 8. NỘI DUNG & MARKETING (CMS)
-- ============================

CREATE TABLE blog_posts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    content         TEXT NOT NULL,
    thumbnail_url   VARCHAR(500),
    author_id       BIGINT,                          -- trỏ về users (nhân viên marketing/admin)
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft | published
    published_at    DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_blog_posts_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE banners (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(150),
    image_url       VARCHAR(500) NOT NULL,
    link_url        VARCHAR(500),
    position        VARCHAR(50) NOT NULL DEFAULT 'homepage_top',
    sort_order      INT NOT NULL DEFAULT 0,
    start_date      DATETIME,
    end_date        DATETIME,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE static_pages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,   -- vd: chinh-sach-doi-tra, gioi-thieu
    content         TEXT NOT NULL,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE newsletter_subscribers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    subscribed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 9. HỖ TRỢ KHÁCH HÀNG
-- ============================

CREATE TABLE contact_messages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    subject         VARCHAR(200),
    message         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | responded
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- DỮ LIỆU MẪU KHỞI TẠO (SEED) CHO PHÂN QUYỀN — có thể xóa nếu không cần
-- =====================================================================
INSERT INTO roles (name, description) VALUES
    ('customer', 'Khách hàng mua sắm trên website'),
    ('admin', 'Quản trị viên toàn quyền hệ thống'),
    ('sales_staff', 'Nhân viên bán hàng / xử lý đơn hàng'),
    ('warehouse_staff', 'Nhân viên kho / quản lý tồn kho'),
    ('accountant', 'Kế toán'),
    ('marketing', 'Nhân viên marketing / quản lý nội dung');

INSERT INTO permissions (code, description) VALUES
    ('product.view', 'Xem sản phẩm'),
    ('product.create', 'Tạo sản phẩm mới'),
    ('product.edit', 'Sửa sản phẩm'),
    ('product.delete', 'Xóa sản phẩm'),
    ('order.view', 'Xem đơn hàng'),
    ('order.update_status', 'Cập nhật trạng thái đơn hàng'),
    ('inventory.manage', 'Quản lý tồn kho'),
    ('report.view', 'Xem báo cáo doanh thu'),
    ('content.manage', 'Quản lý nội dung (blog, banner, trang tĩnh)'),
    ('user.manage', 'Quản lý tài khoản người dùng/nhân viên');

