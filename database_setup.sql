-- ================================================================
-- RUPIKSHA Database Setup
-- Run: mysql -u root -p rupiksha < database_setup.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS rupiksha;
USE rupiksha;

-- ─── USERS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100),
  phone         VARCHAR(15),
  email         VARCHAR(100),
  address       TEXT,
  role          ENUM('ADMIN','NATIONAL','STATE','REGIONAL','MEMBER') DEFAULT 'MEMBER',
  territory     VARCHAR(100),    -- 'india' | 'UP' | 'Lucknow' etc.
  status        ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  photo_url     VARCHAR(255),
  last_login    DATETIME,
  created_by    INT,
  created_at    DATETIME DEFAULT NOW(),
  profile_kyc_status  ENUM('DONE','NOT_DONE','PENDING') DEFAULT 'NOT_DONE',
  aeps_kyc_status     ENUM('DONE','NOT_DONE','PENDING') DEFAULT 'NOT_DONE',
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── PERMISSIONS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  module_name  VARCHAR(50)  NOT NULL,   -- 'MEMBERS', 'KYC', 'WALLET' etc.
  action_name  VARCHAR(50)  NOT NULL,   -- 'ADD_MEMBER', 'CREDIT_FUND' etc.
  is_allowed   BOOLEAN DEFAULT FALSE,
  updated_at   DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_perm (user_id, module_name, action_name)
);

-- ─── WALLETS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNIQUE NOT NULL,
  balance       DECIMAL(15,3) DEFAULT 0,
  locked_amount DECIMAL(15,3) DEFAULT 0,
  territory     VARCHAR(100),
  status        ENUM('ACTIVE','PENDING','LOCKED') DEFAULT 'ACTIVE',
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── TRANSACTIONS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        ENUM('AEPS','PAYOUT','CMS','DMT','BHARAT_CONNECT','RECHARGE','BBPS','OTHER'),
  amount      DECIMAL(15,2) DEFAULT 0,
  commission  DECIMAL(10,2) DEFAULT 0,
  charges     DECIMAL(10,2) DEFAULT 0,
  status      ENUM('SUCCESS','FAILED','PENDING') DEFAULT 'PENDING',
  territory   VARCHAR(100),
  ref_no      VARCHAR(50),
  created_at  DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_txn_type ON transactions(type, status, created_at);
CREATE INDEX idx_txn_territory ON transactions(territory, created_at);

-- ─── CHARGES & COMMISSIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS charges (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  amount    DECIMAL(10,2),
  territory VARCHAR(100),
  created_at DATETIME DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS commissions (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  amount    DECIMAL(10,2),
  territory VARCHAR(100),
  created_at DATETIME DEFAULT NOW()
);

-- ─── LIVE LOCATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_locations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNIQUE NOT NULL,
  latitude    DECIMAL(10,6),
  longitude   DECIMAL(10,6),
  recorded_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================================
-- DEFAULT ADMIN USER (password: Admin@123)
-- Change password after first login!
-- ================================================================
INSERT IGNORE INTO users (username, password_hash, full_name, role, territory, status)
VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin@123
  'Super Admin',
  'ADMIN',
  'india',
  'ACTIVE'
);

-- ================================================================
-- SAMPLE DATA (Optional - comment out in production)
-- ================================================================

-- Sample National Header
INSERT IGNORE INTO users (username, password_hash, full_name, phone, role, territory, status)
VALUES ('national_head', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'National Head India', '9876500001', 'NATIONAL', 'india', 'ACTIVE');

-- Sample State Header (UP)
INSERT IGNORE INTO users (username, password_hash, full_name, phone, role, territory, status)
VALUES ('state_up', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'UP State Head', '9876500002', 'STATE', 'Uttar Pradesh', 'ACTIVE');

-- Sample Regional Header
INSERT IGNORE INTO users (username, password_hash, full_name, phone, role, territory, status)
VALUES ('regional_lko', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucknow Regional Head', '9876500003', 'REGIONAL', 'Lucknow', 'ACTIVE');

SELECT 'Database setup complete!' as message;
SELECT 'Default admin: username=admin, password=Admin@123' as note;
