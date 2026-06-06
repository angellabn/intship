-- ============================================================
-- Cart Management Module - MySQL Schema
-- ============================================================


-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    price       DECIMAL(10,2)  NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    description TEXT
);

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    cart_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT         NOT NULL,
    product_id  BIGINT         NOT NULL,
    quantity    INT            NOT NULL,
    total_price DECIMAL(10,2),
    created_at  DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_product FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON DELETE CASCADE
);

-- Sample products
INSERT INTO products (name, price, stock, description) VALUES
('Wireless Headphones',  1999.99, 50,  'Premium noise-cancelling wireless headphones'),
('Mechanical Keyboard',  3499.00, 30,  'RGB mechanical keyboard with blue switches'),
('USB-C Hub',             899.50, 100, '7-in-1 USB-C hub with HDMI and PD charging'),
('Laptop Stand',         1299.00, 75,  'Adjustable aluminum laptop stand'),
('Webcam 1080p',         2199.00, 20,  'Full HD webcam with built-in microphone');
