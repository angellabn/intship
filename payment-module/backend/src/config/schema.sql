-- Create database
CREATE DATABASE IF NOT EXISTS payment_db;
USE payment_db;

-- Orders table (prerequisite)
CREATE TABLE IF NOT EXISTS orders (
  order_id     INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id     INT PRIMARY KEY AUTO_INCREMENT,
  order_id       INT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid',
  transaction_ref VARCHAR(100),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed sample orders
INSERT INTO orders (customer_name, customer_email, total_amount, order_status) VALUES
  ('Alice Johnson', 'alice@example.com', 1299.00, 'Completed'),
  ('Bob Smith',     'bob@example.com',   599.50,  'Completed'),
  ('Carol White',   'carol@example.com', 2499.99, 'Cancelled'),
  ('David Lee',     'david@example.com', 149.00,  'Returned'),
  ('Eva Brown',     'eva@example.com',   899.00,  'Completed');

-- Seed sample payments
INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_ref) VALUES
  (1, 1299.00, 'Credit Card', 'Paid',     'ch_test_001'),
  (2,  599.50, 'PayPal',      'Paid',     'pp_test_002'),
  (3, 2499.99, 'Credit Card', 'Refunded', 'ch_test_003'),
  (4,  149.00, 'Bank Transfer','Paid',    'bt_test_004'),
  (5,  899.00, 'PayPal',      'Failed',   NULL);

-- Seed admin user (password: admin123)
INSERT INTO admin_users (name, email, password) VALUES
  ('Admin User', 'admin@payment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
