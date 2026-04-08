-- ============================================
-- Product Management Module - Database Setup
-- ============================================

CREATE DATABASE IF NOT EXISTS product_management;
USE product_management;

-- Categories table (referenced by products)
CREATE TABLE IF NOT EXISTS categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table (as per the assignment spec)
CREATE TABLE IF NOT EXISTS products (
  product_id    INT PRIMARY KEY AUTO_INCREMENT,
  product_name  VARCHAR(150) NOT NULL,
  description   VARCHAR(500),
  price         DECIMAL(10,2) NOT NULL,
  SKU           VARCHAR(50) UNIQUE NOT NULL,
  category_id   INT,
  inventory_count INT DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status        BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Seed categories
INSERT INTO categories (category_name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Home & Kitchen'),
  ('Books'),
  ('Toys');

-- Seed sample products
INSERT INTO products (product_name, description, price, SKU, category_id, inventory_count, status) VALUES
  ('Wireless Earbuds', 'Noise-cancelling Bluetooth earbuds with 24hr battery', 1999.00, 'SKU-101', 1, 24, TRUE),
  ('Cotton T-Shirt', '100% premium cotton basic tee, available in 5 colors', 399.00, 'SKU-202', 2, 3, TRUE),
  ('Table Lamp', 'Minimalist LED desk lamp with adjustable brightness', 849.00, 'SKU-303', 3, 0, FALSE),
  ('JavaScript Guide', 'Complete JavaScript programming guide for beginners', 549.00, 'SKU-404', 4, 12, TRUE),
  ('Wooden Toy Car Set', 'Set of 5 colorful wooden toy cars for kids', 299.00, 'SKU-505', 5, 5, TRUE);
