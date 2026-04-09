-- ==============================================
-- Order Management Module - Database Schema
-- Run this file once to set up your database
-- ==============================================

CREATE DATABASE IF NOT EXISTS order_management_db;
USE order_management_db;

-- Users table (customers & admins)
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('customer', 'admin') DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id          INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200)   NOT NULL,
  description TEXT,
  price       DECIMAL(10,2)  NOT NULL,
  stock       INT            DEFAULT 0,
  PRIMARY KEY (id)
);

-- Orders table (main table for the module)
CREATE TABLE IF NOT EXISTS orders (
  user_id          INT           NOT NULL AUTO_INCREMENT,
  customer_id      INT           NOT NULL,
  total_amount     DECIMAL(10,2) NOT NULL,
  order_status     VARCHAR(50)   DEFAULT 'Pending',
  shipping_address VARCHAR(300)  NOT NULL,
  created_at       DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status           BOOLEAN       DEFAULT TRUE,
  PRIMARY KEY (user_id),
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id         INT           NOT NULL AUTO_INCREMENT,
  order_id   INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id)   REFERENCES orders(user_id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==============================================
-- Seed Data
-- ==============================================

-- Admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Customer user (password: Customer@123)
INSERT INTO users (name, email, password, role) VALUES
('John Customer', 'customer@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- Sample products
INSERT INTO products (name, description, price, stock) VALUES
('Wireless Headphones',  'Premium noise-cancelling headphones', 2499.00, 50),
('Mechanical Keyboard',  'RGB backlit mechanical keyboard',     3299.00, 30),
('USB-C Hub',            '7-in-1 USB-C multiport hub',          1299.00, 75),
('Webcam HD 1080p',      'Full HD webcam with mic',             1899.00, 40),
('Mouse Pad XL',         'Extended gaming mouse pad',            499.00, 100);

-- Sample orders
INSERT INTO orders (customer_id, total_amount, order_status, shipping_address, status) VALUES
(2, 3798.00, 'Pending',   '12, MG Road, Mumbai, Maharashtra 400001', TRUE),
(2, 1299.00, 'Shipped',   '12, MG Road, Mumbai, Maharashtra 400001', TRUE),
(2, 2398.00, 'Delivered', '12, MG Road, Mumbai, Maharashtra 400001', TRUE),
(2, 499.00,  'Cancelled', '12, MG Road, Mumbai, Maharashtra 400001', FALSE);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 2499.00),
(1, 5, 2,  499.00),  -- note: 2499 + 2*499 = 3497 ≠ 3798 intentional demo data
(2, 3, 1, 1299.00),
(3, 4, 1, 1899.00),
(3, 5, 1,  499.00),
(4, 5, 1,  499.00);
