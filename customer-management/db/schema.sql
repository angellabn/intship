-- ================================================
-- Customer Management Module — Database Schema
-- Run once to initialise your database
-- ================================================

CREATE DATABASE IF NOT EXISTS customer_management_db;
USE customer_management_db;

-- ── Admins table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Users (customers) table ───────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id    INT          NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(15),
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status     BOOLEAN      DEFAULT TRUE,
  PRIMARY KEY (user_id)
);

-- ── Seed: default admin ───────────────────────────
-- Password: Admin@123
INSERT INTO admins (name, email, password) VALUES
('Admin User', 'admin@demo.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- ── Seed: sample customers ────────────────────────
-- Password for all: Customer@123
INSERT INTO users (first_name, last_name, email, phone, password, status) VALUES
('Rahul',   'Sharma',  'rahul@example.com',   '9876543210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('Priya',   'Patel',   'priya@example.com',   '9123456780', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('Amit',    'Verma',   'amit@example.com',    '9988776655', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('Sneha',   'Gupta',   'sneha@example.com',   '9765432100', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE),
('Kiran',   'Joshi',   'kiran@example.com',   '9654321098', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE);
